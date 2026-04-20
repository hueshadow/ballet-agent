const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

module.exports.main = createRouter({
  /** 新增上课记录 */
  async add(event, openid, db) {
    const {
      date, studioId, studioName, teacherId, teacherName,
      courseType, level, durationMin, photos, notes,
      bodyRating, teacherRating, tags, moodEmoji, paidVia, source
    } = event

    if (!date || !studioId || !teacherId || !courseType || !durationMin) {
      return fail(ErrorCode.PARAM_ERROR, '请填写必填字段')
    }

    const today = new Date().toISOString().slice(0, 10)
    const autoSource = source || (date === today ? 'checkin' : 'backfill')

    const data = {
      _openid: openid,
      date,
      studioId,
      studioName: studioName || '',
      teacherId,
      teacherName: teacherName || '',
      courseType,
      level: level || '',
      durationMin: parseInt(durationMin) || 60,
      photos: photos || [],
      notes: (notes || '').trim(),
      bodyRating: bodyRating || 0,
      teacherRating: teacherRating || 0,
      tags: tags || [],
      moodEmoji: moodEmoji || '',
      paidVia: paidVia || '',
      source: autoSource,
      createdAt: db.serverDate()
    }

    const res = await db.collection('lessons').add({ data })
    return success({ _id: res._id })
  },

  /** 查询列表（支持筛选） */
  async getList(event, openid, db) {
    const { studioId, teacherId, courseType, month, keyword, moodEmoji, skip = 0, limit = 20 } = event

    const where = { _openid: openid }
    if (studioId) where.studioId = studioId
    if (teacherId) where.teacherId = teacherId
    if (courseType) where.courseType = courseType
    if (moodEmoji) where.moodEmoji = moodEmoji
    if (month) {
      // month 格式 "2026-04"
      const _ = db.command
      where.date = _.gte(month + '-01').and(_.lte(month + '-31'))
    }

    let query = db.collection('lessons')
      .where(where)
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)

    const res = await query.get()

    // 关键字搜索（笔记 + 标签，云开发不支持 $regex，前端过滤）
    let data = res.data
    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      data = data.filter(item => {
        const notesMatch = (item.notes || '').toLowerCase().includes(kw)
        const tagsMatch = (item.tags || []).some(t => t.toLowerCase().includes(kw))
        return notesMatch || tagsMatch
      })
    }

    return success(data)
  },

  /** 获取单条详情 */
  async getDetail(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少记录 ID')

    const res = await db.collection('lessons')
      .where({ _id, _openid: openid })
      .limit(1)
      .get()

    if (res.data.length === 0) return fail(ErrorCode.NOT_FOUND, '记录不存在')
    return success(res.data[0])
  },

  /** 更新记录 */
  async update(event, openid, db) {
    const {
      _id, date, studioId, studioName, teacherId, teacherName,
      courseType, level, durationMin, photos, notes,
      bodyRating, teacherRating, tags, moodEmoji, paidVia
    } = event

    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少记录 ID')

    await db.collection('lessons')
      .where({ _id, _openid: openid })
      .update({
        data: {
          date, studioId, studioName, teacherId, teacherName,
          courseType, level, durationMin: parseInt(durationMin) || 60,
          photos: photos || [], notes: (notes || '').trim(),
          bodyRating: bodyRating || 0, teacherRating: teacherRating || 0,
          tags: tags || [], moodEmoji: moodEmoji || '', paidVia: paidVia || '',
          updatedAt: db.serverDate()
        }
      })
    return success(null)
  },

  /** 删除记录 */
  async remove(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少记录 ID')

    await db.collection('lessons')
      .where({ _id, _openid: openid })
      .remove()
    return success(null)
  },

  /** 统计数据（首页看板 + 统计页） */
  async getStats(event, openid, db) {
    // 拉取所有记录的关键字段
    const allRes = await db.collection('lessons')
      .where({ _openid: openid })
      .field({ date: true, durationMin: true, studioName: true, teacherName: true, courseType: true })
      .orderBy('date', 'asc')
      .limit(1000)
      .get()

    const lessons = allRes.data
    const total = lessons.length
    if (total === 0) {
      return success({
        totalCount: 0, totalHours: 0,
        monthCount: 0, monthHours: 0,
        weekCount: 0, weekGoal: 3,
        daysSinceLast: -1,
        monthly: [], studioDist: [], teacherDist: [], typeDist: [],
        milestones: []
      })
    }

    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const currentMonth = todayStr.slice(0, 7)

    // 本周起止（周一开始）
    const dayOfWeek = now.getDay() || 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek + 1)
    const weekStartStr = weekStart.toISOString().slice(0, 10)

    let totalHours = 0, monthCount = 0, monthHours = 0, weekCount = 0

    // 分布统计
    const studioMap = {}, teacherMap = {}, typeMap = {}, monthlyMap = {}

    lessons.forEach(l => {
      const hours = (l.durationMin || 60) / 60
      totalHours += hours

      if (l.date && l.date.startsWith(currentMonth)) {
        monthCount++
        monthHours += hours
      }

      if (l.date && l.date >= weekStartStr && l.date <= todayStr) {
        weekCount++
      }

      // 月度趋势
      const m = (l.date || '').slice(0, 7)
      if (m) monthlyMap[m] = (monthlyMap[m] || 0) + 1

      // 分布
      if (l.studioName) studioMap[l.studioName] = (studioMap[l.studioName] || 0) + 1
      if (l.teacherName) teacherMap[l.teacherName] = (teacherMap[l.teacherName] || 0) + 1
      if (l.courseType) typeMap[l.courseType] = (typeMap[l.courseType] || 0) + 1
    })

    // 最近一节课距今天数
    const lastDate = lessons[lessons.length - 1].date
    const diffMs = new Date(todayStr) - new Date(lastDate)
    const daysSinceLast = Math.max(0, Math.floor(diffMs / 86400000))

    // 近 12 个月折线
    const monthly = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      monthly.push({ month: key, count: monthlyMap[key] || 0 })
    }

    // 分布排序
    const toSorted = (map) => Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const teacherDist = toSorted(teacherMap).slice(0, 10)

    // 里程碑
    const MILESTONES = [10, 50, 100, 200, 500, 1000]
    const milestones = MILESTONES.map(target => {
      if (total >= target) {
        const achievedLesson = lessons[target - 1]
        return { target, achieved: true, date: achievedLesson ? achievedLesson.date : '' }
      }
      return { target, achieved: false, current: total }
    })

    return success({
      totalCount: total,
      totalHours: Math.round(totalHours * 10) / 10,
      monthCount,
      monthHours: Math.round(monthHours * 10) / 10,
      weekCount,
      daysSinceLast,
      monthly,
      studioDist: toSorted(studioMap),
      teacherDist,
      typeDist: toSorted(typeMap),
      milestones
    })
  },

  /** 获取历史标签（去重） */
  async getTags(event, openid, db) {
    const res = await db.collection('lessons')
      .where({ _openid: openid })
      .field({ tags: true })
      .limit(200)
      .get()

    const tagSet = new Set()
    res.data.forEach(item => {
      (item.tags || []).forEach(t => tagSet.add(t))
    })
    return success([...tagSet].sort())
  }
})
