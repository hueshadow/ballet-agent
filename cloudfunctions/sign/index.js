const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

/** 文案库（云端备份，前端也有一份） */
const QUOTES = [
  '芭蕾是用脚写出的诗。', '舞蹈是灵魂的语言。', '每一个优雅的动作，都藏着无数次重复。',
  '把杆是芭蕾舞者永远的朋友。', '没有完美的 tendu，就没有完美的一切。',
  '芭蕾不会变简单，只是你变得更强了。', '今天的汗水，是明天的勋章。',
  '上完课的快乐无可替代。', '又是被芭蕾治愈的一天。', '在旋转中找到静止。',
  '脚尖上的世界，轻盈而有力。', '身体记住的，比头脑更持久。', '你比你以为的更强。',
  '每一节课都算数。', '保持热爱，奔赴山海。', '慢慢来，比较快。',
  '坚持本身就是天赋。', '进步不总是直线，但方向不会错。',
  '在呼吸与节拍之间找到自由。', '舞台很远，但每一步都在靠近。'
]

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}

module.exports.main = createRouter({
  /** 通过 Gemini 生成日签图 */
  async generate(event, openid, db) {
    const { lessonId, date, studioName, teacherName, courseType, notes, tags, moodEmoji } = event

    const quote = getRandomQuote()

    // 组合 prompt
    const prompt = buildPrompt({ date, studioName, teacherName, courseType, notes, tags, moodEmoji, quote })

    let imageFileId = ''
    let source = 'gemini'

    try {
      // 调用 Gemini 生图
      const proxyUrl = process.env.GEMINI_PROXY_URL
      const apiKey = process.env.GEMINI_API_KEY

      if (!proxyUrl || !apiKey) {
        throw new Error('Gemini 代理未配置')
      }

      const axios = require('axios')
      const response = await axios.post(
        `${proxyUrl}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        },
        { timeout: 55000 }
      )

      // 解析返回的图片
      const parts = response.data.candidates?.[0]?.content?.parts || []
      const imagePart = parts.find(p => p.inlineData)

      if (imagePart && imagePart.inlineData) {
        // 将 base64 图片保存到云存储
        const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
        const cloud = require('wx-server-sdk')
        const uploadRes = await cloud.uploadFile({
          cloudPath: `daily-signs/${Date.now()}-${Math.random().toString(36).slice(2)}.png`,
          fileContent: buffer
        })
        imageFileId = uploadRes.fileID
      } else {
        throw new Error('Gemini 未返回图片')
      }
    } catch (err) {
      console.warn('[sign] Gemini 生图失败，使用 Canvas 兜底:', err.message)
      source = 'canvas_fallback'
      // Canvas 兜底在前端执行，云函数只返回文案和来源标记
    }

    // 保存日签记录
    const signData = {
      _openid: openid,
      date: date || new Date().toISOString().slice(0, 10),
      lessonId: lessonId || '',
      imageFileId,
      prompt,
      quote,
      source,
      createdAt: db.serverDate()
    }

    const res = await db.collection('dailySigns').add({ data: signData })

    return success({
      _id: res._id,
      imageFileId,
      quote,
      source
    })
  },

  /** 获取日签列表 */
  async getList(event, openid, db) {
    const res = await db.collection('dailySigns')
      .where({ _openid: openid })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    return success(res.data)
  }
})

function buildPrompt({ date, studioName, teacherName, courseType, notes, tags, moodEmoji, quote }) {
  let prompt = `生成一张 1080x1920 竖版芭蕾主题日签海报。
风格：极简黑白线条插画，大量留白，优雅克制。
主体：一位芭蕾舞者的优雅剪影或线条画。

日期：${date || '今天'}
`
  if (studioName) prompt += `机构：${studioName}\n`
  if (teacherName) prompt += `老师：${teacherName}\n`
  if (courseType) prompt += `课型：${courseType}\n`
  if (moodEmoji) prompt += `心情：${moodEmoji}\n`
  if (tags && tags.length) prompt += `主题：${tags.join('、')}\n`

  prompt += `\n在画面底部用优雅的中文字体写上这句话：\n"${quote}"\n`
  prompt += `在画面顶部右上角小字标注日期：${date}\n`
  prompt += `\n整体风格简约高级，适合分享到社交媒体。不要彩色，只用黑白灰。`

  return prompt
}
