const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

module.exports.main = createRouter({
  /** 获取课表列表（指定日期范围） */
  async getList(event, openid, db) {
    const { startDate, endDate } = event
    const _ = db.command
    const where = { _openid: openid }

    if (startDate && endDate) {
      where.date = _.gte(startDate).and(_.lte(endDate))
    }

    const res = await db.collection('schedules')
      .where(where)
      .orderBy('date', 'asc')
      .orderBy('startTime', 'asc')
      .limit(200)
      .get()

    return success(res.data)
  },

  /** 新增课表 */
  async add(event, openid, db) {
    const { date, startTime, durationMin, studioId, studioName, teacherId, teacherName, courseType, repeatRule, reminderLeadMin } = event

    if (!date || !startTime || !studioId) {
      return fail(ErrorCode.PARAM_ERROR, '请填写日期、时间和机构')
    }

    const baseData = {
      _openid: openid,
      startTime,
      durationMin: parseInt(durationMin) || 60,
      studioId,
      studioName: studioName || '',
      teacherId: teacherId || '',
      teacherName: teacherName || '',
      courseType: courseType || '',
      repeatRule: repeatRule || 'none',
      reminderLeadMin: parseInt(reminderLeadMin) || 30,
      createdAt: db.serverDate()
    }

    const dates = generateDates(date, repeatRule || 'none', 12)
    const ids = []

    for (const d of dates) {
      const data = { ...baseData, date: d }
      const res = await db.collection('schedules').add({ data })
      ids.push(res._id)
    }

    return success({ ids, count: ids.length })
  },

  /** 更新单条课表 */
  async update(event, openid, db) {
    const { _id, date, startTime, durationMin, studioId, studioName, teacherId, teacherName, courseType, reminderLeadMin } = event

    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少课表 ID')

    await db.collection('schedules')
      .where({ _id, _openid: openid })
      .update({
        data: {
          date, startTime,
          durationMin: parseInt(durationMin) || 60,
          studioId, studioName: studioName || '',
          teacherId: teacherId || '', teacherName: teacherName || '',
          courseType: courseType || '',
          reminderLeadMin: parseInt(reminderLeadMin) || 30,
          updatedAt: db.serverDate()
        }
      })

    return success(null)
  },

  /** 删除课表（单条或后续所有） */
  async remove(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少课表 ID')

    await db.collection('schedules')
      .where({ _id, _openid: openid })
      .remove()

    return success(null)
  },

  /** 获取有课日期列表（用于日历标记） */
  async getMarkedDates(event, openid, db) {
    const { month } = event
    if (!month) return fail(ErrorCode.PARAM_ERROR, '缺少月份')

    const _ = db.command
    const res = await db.collection('schedules')
      .where({
        _openid: openid,
        date: _.gte(month + '-01').and(_.lte(month + '-31'))
      })
      .field({ date: true })
      .get()

    const dates = [...new Set(res.data.map(s => s.date))]
    return success(dates)
  }
})

/** 根据重复规则生成日期列表 */
function generateDates(startDate, rule, weeksAhead) {
  const dates = [startDate]
  if (rule === 'none') return dates

  const interval = rule === 'weekly' ? 7 : 14
  const start = new Date(startDate)

  for (let i = 1; i < weeksAhead; i++) {
    const next = new Date(start)
    next.setDate(start.getDate() + interval * i)
    dates.push(next.toISOString().slice(0, 10))
  }

  return dates
}
