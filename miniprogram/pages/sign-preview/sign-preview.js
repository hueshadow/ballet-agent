const { callFunction } = require('../../utils/cloud')
const { getRandomQuote } = require('../../utils/quotes')

// Canvas 兜底模板配置（5 套极简黑白风）
const TEMPLATES = [
  { bg: '#ffffff', textColor: '#000000', accentY: 0.35 },
  { bg: '#000000', textColor: '#ffffff', accentY: 0.4 },
  { bg: '#f5f5f5', textColor: '#333333', accentY: 0.3 },
  { bg: '#ffffff', textColor: '#000000', accentY: 0.45 },
  { bg: '#1a1a1a', textColor: '#e0e0e0', accentY: 0.38 }
]

Page({
  data: {
    lessonId: '',
    lessonInfo: null,
    signImageUrl: '',
    quote: '',
    source: '',
    generating: false,
    canvasReady: false,
    signId: ''
  },

  onLoad(options) {
    if (options.lessonId) {
      this.setData({ lessonId: options.lessonId })
      this.loadLessonAndGenerate(options.lessonId)
    }
  },

  async loadLessonAndGenerate(lessonId) {
    try {
      const lesson = await callFunction('lesson', { action: 'getDetail', _id: lessonId })
      this.setData({ lessonInfo: lesson })
      this.generateSign(lesson)
    } catch (err) {
      console.error('加载课时失败', err)
      // 无课时信息也可以生成兜底日签
      this.generateCanvasFallback({})
    }
  },

  async generateSign(lesson) {
    this.setData({ generating: true })

    try {
      const res = await callFunction('sign', {
        action: 'generate',
        lessonId: lesson._id,
        date: lesson.date,
        studioName: lesson.studioName,
        teacherName: lesson.teacherName,
        courseType: lesson.courseType,
        notes: lesson.notes,
        tags: lesson.tags,
        moodEmoji: lesson.moodEmoji
      }, { showError: false })

      this.setData({
        signId: res._id,
        quote: res.quote,
        source: res.source
      })

      if (res.source === 'gemini' && res.imageFileId) {
        this.setData({ signImageUrl: res.imageFileId, generating: false })
      } else {
        // Canvas 兜底
        this.generateCanvasFallback(lesson, res.quote)
      }
    } catch (err) {
      console.warn('云函数调用失败，使用 Canvas 兜底', err)
      this.generateCanvasFallback(lesson)
    }
  },

  generateCanvasFallback(lesson, quote) {
    const finalQuote = quote || getRandomQuote()
    this.setData({ quote: finalQuote, source: 'canvas_fallback', canvasReady: true })

    // 等待 canvas 渲染
    setTimeout(() => this.drawCanvas(lesson, finalQuote), 100)
  },

  drawCanvas(lesson, quote) {
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    const query = wx.createSelectorQuery()
    query.select('#signCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          this.setData({ generating: false })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getWindowInfo().pixelRatio
        const w = 1080
        const h = 1920

        canvas.width = w
        canvas.height = h

        // 背景
        ctx.fillStyle = tpl.bg
        ctx.fillRect(0, 0, w, h)

        // 装饰线条（极简芭蕾剪影用线条代替）
        ctx.strokeStyle = tpl.textColor
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.15

        // 简约弧线装饰
        ctx.beginPath()
        ctx.arc(w / 2, h * tpl.accentY, 200, Math.PI * 0.8, Math.PI * 2.2)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(w / 2 - 100, h * tpl.accentY + 200)
        ctx.lineTo(w / 2, h * tpl.accentY + 350)
        ctx.lineTo(w / 2 + 30, h * tpl.accentY + 200)
        ctx.stroke()

        ctx.globalAlpha = 1

        // 日期（右上角）
        const dateStr = (lesson && lesson.date) || new Date().toISOString().slice(0, 10)
        ctx.fillStyle = tpl.textColor
        ctx.globalAlpha = 0.4
        ctx.font = '36px -apple-system, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(dateStr, w - 80, 100)

        // 课程信息
        ctx.globalAlpha = 0.5
        ctx.font = '32px -apple-system, sans-serif'
        ctx.textAlign = 'center'
        let infoY = h * 0.6
        if (lesson && lesson.studioName) {
          ctx.fillText(lesson.studioName + (lesson.teacherName ? ' · ' + lesson.teacherName : ''), w / 2, infoY)
          infoY += 50
        }
        if (lesson && lesson.courseType) {
          ctx.fillText(lesson.courseType + (lesson.durationMin ? ' · ' + lesson.durationMin + '分钟' : ''), w / 2, infoY)
        }

        // 文案（主体）
        ctx.globalAlpha = 1
        ctx.font = '500 48px -apple-system, sans-serif'
        ctx.textAlign = 'center'

        // 自动换行
        const maxWidth = w - 160
        const lines = wrapText(ctx, quote, maxWidth)
        const lineHeight = 72
        const startY = h * 0.72

        lines.forEach((line, i) => {
          ctx.fillText(line, w / 2, startY + i * lineHeight)
        })

        // 底部品牌
        ctx.globalAlpha = 0.3
        ctx.font = '28px -apple-system, sans-serif'
        ctx.fillText('芭蕾管家', w / 2, h - 120)

        // 导出图片
        wx.canvasToTempFilePath({
          canvas,
          width: w,
          height: h,
          destWidth: w,
          destHeight: h,
          fileType: 'png',
          success: (res) => {
            this.setData({ signImageUrl: res.tempFilePath, generating: false })
          },
          fail: () => {
            this.setData({ generating: false })
            wx.showToast({ title: '生成失败', icon: 'none' })
          }
        })
      })
  },

  onRegenerate() {
    const lesson = this.data.lessonInfo || {}
    this.setData({ signImageUrl: '', generating: true })
    this.generateCanvasFallback(lesson)
  },

  onSaveToAlbum() {
    const { signImageUrl } = this.data
    if (!signImageUrl) return

    wx.saveImageToPhotosAlbum({
      filePath: signImageUrl,
      success() {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail(err) {
        if (err.errMsg.includes('deny') || err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许访问相册',
            success(res) {
              if (res.confirm) wx.openSetting()
            }
          })
        }
      }
    })
  }
})

function wrapText(ctx, text, maxWidth) {
  const lines = []
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const test = current + text[i]
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = text[i]
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
