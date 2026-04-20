const { createRouter } = require('../common/router')
const { success, fail, ErrorCode } = require('../common/response')

module.exports.main = createRouter({
  /** CSV 批量导入课时记录 */
  async importLessons(event, openid, db) {
    const { records } = event

    if (!records || !Array.isArray(records)) {
      return fail(ErrorCode.PARAM_ERROR, '无效的导入数据')
    }

    if (records.length > 1000) {
      return fail(ErrorCode.LIMIT_EXCEEDED, '单次最多导入 1000 条')
    }

    // 获取现有机构和老师用于匹配
    const [studiosRes, teachersRes] = await Promise.all([
      db.collection('studios').where({ _openid: openid }).get(),
      db.collection('teachers').where({ _openid: openid }).get()
    ])

    const studioMap = {}
    studiosRes.data.forEach(s => { studioMap[s.name] = s._id })
    const teacherMap = {}
    teachersRes.data.forEach(t => { teacherMap[t.name] = t._id })

    let imported = 0
    let errors = []

    // 分批写入，每批 50 条
    for (let i = 0; i < records.length; i++) {
      const r = records[i]

      // 校验必填字段
      if (!r.date || !r.studio || !r.teacher || !r.courseType || !r.durationMin) {
        errors.push({ row: i + 1, message: '缺少必填字段' })
        continue
      }

      // 日期格式校验
      if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
        errors.push({ row: i + 1, message: '日期格式错误' })
        continue
      }

      // 自动新建不存在的机构
      let studioId = studioMap[r.studio]
      if (!studioId) {
        const res = await db.collection('studios').add({
          data: {
            _openid: openid,
            name: r.studio,
            city: '',
            address: '',
            logoFileId: '',
            createdAt: db.serverDate()
          }
        })
        studioId = res._id
        studioMap[r.studio] = studioId
      }

      // 自动新建不存在的老师
      let teacherId = teacherMap[r.teacher]
      if (!teacherId) {
        const res = await db.collection('teachers').add({
          data: {
            _openid: openid,
            name: r.teacher,
            studioIds: [studioId],
            intro: '',
            avatarFileId: '',
            createdAt: db.serverDate()
          }
        })
        teacherId = res._id
        teacherMap[r.teacher] = teacherId
      }

      try {
        await db.collection('lessons').add({
          data: {
            _openid: openid,
            date: r.date,
            studioId,
            studioName: r.studio,
            teacherId,
            teacherName: r.teacher,
            courseType: r.courseType,
            level: r.level || '',
            durationMin: parseInt(r.durationMin) || 60,
            photos: [],
            notes: (r.notes || '').trim(),
            bodyRating: parseInt(r.bodyRating) || 0,
            teacherRating: parseInt(r.teacherRating) || 0,
            tags: r.tags ? r.tags.split('|').map(t => t.trim()).filter(Boolean) : [],
            moodEmoji: r.moodEmoji || '',
            paidVia: '',
            source: 'csv_import',
            createdAt: db.serverDate()
          }
        })
        imported++
      } catch (err) {
        errors.push({ row: i + 1, message: err.message })
      }
    }

    return success({ imported, total: records.length, errors })
  },

  /** 一键导出全部用户数据为 JSON */
  async exportAll(event, openid, db) {
    const COLLECTIONS = [
      'users', 'studios', 'teachers', 'courseTypes',
      'lessons', 'moveCheckins', 'dailySigns', 'schedules'
    ]

    const exportData = {
      exportedAt: new Date().toISOString(),
      collections: {}
    }

    for (const name of COLLECTIONS) {
      try {
        const res = await db.collection(name)
          .where({ _openid: openid })
          .limit(1000)
          .get()
        exportData.collections[name] = res.data
      } catch (err) {
        exportData.collections[name] = { error: err.message }
      }
    }

    const totalRecords = Object.values(exportData.collections)
      .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)

    if (totalRecords === 0) {
      return fail(ErrorCode.NOT_FOUND, '暂无数据可导出')
    }

    // 上传 JSON 到云存储
    const cloud = require('wx-server-sdk')
    const jsonStr = JSON.stringify(exportData, null, 2)
    const buffer = Buffer.from(jsonStr, 'utf8')

    const uploadRes = await cloud.uploadFile({
      cloudPath: `exports/${openid}-${Date.now()}.json`,
      fileContent: buffer
    })

    return success({
      fileID: uploadRes.fileID,
      totalRecords,
      collections: Object.fromEntries(
        Object.entries(exportData.collections).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
      )
    })
  }
})
