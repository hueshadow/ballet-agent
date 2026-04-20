const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 提醒定时云函数
 * 需要在云开发控制台配置定时触发器：每 10 分钟执行一次
 * 触发器配置：{ "triggers": [{ "name": "reminder-timer", "type": "timer", "config": "0 *\/10 * * * * *" }] }
 *
 * 逻辑：
 * 1. 课前提醒：查找 reminderLeadMin 分钟内即将开始的课程，发送订阅消息
 * 2. 课后补录提醒：查找结束 2 小时后仍无对应上课记录的课程
 */
exports.main = async () => {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // 获取今天的所有课表
  const schedulesRes = await db.collection('schedules')
    .where({ date: todayStr })
    .get()

  const results = { preclass: 0, postclass: 0, errors: [] }

  for (const schedule of schedulesRes.data) {
    const [h, m] = (schedule.startTime || '19:00').split(':').map(Number)
    const startMinutes = h * 60 + m
    const endMinutes = startMinutes + (schedule.durationMin || 60)
    const leadMin = schedule.reminderLeadMin || 30

    // 课前提醒：在 [startMinutes - leadMin, startMinutes - leadMin + 10] 窗口内
    const preReminderMinute = startMinutes - leadMin
    if (currentMinutes >= preReminderMinute && currentMinutes < preReminderMinute + 10) {
      const sent = await checkAndLog(db, schedule, 'preclass')
      if (sent) {
        // 发送订阅消息（需要先在微信后台配置模板 ID）
        try {
          await sendSubscribeMessage(schedule, 'preclass')
          results.preclass++
        } catch (err) {
          results.errors.push({ id: schedule._id, type: 'preclass', error: err.message })
        }
      }
    }

    // 课后补录提醒：结束后 2 小时（120 分钟）窗口
    const postReminderMinute = endMinutes + 120
    if (currentMinutes >= postReminderMinute && currentMinutes < postReminderMinute + 10) {
      // 检查是否已有对应上课记录
      const lessonCheck = await db.collection('lessons')
        .where({
          _openid: schedule._openid,
          date: todayStr,
          studioId: schedule.studioId
        })
        .count()

      if (lessonCheck.total === 0) {
        const sent = await checkAndLog(db, schedule, 'postclass_backfill')
        if (sent) {
          try {
            await sendSubscribeMessage(schedule, 'postclass_backfill')
            results.postclass++
          } catch (err) {
            results.errors.push({ id: schedule._id, type: 'postclass', error: err.message })
          }
        }
      }
    }
  }

  return { code: 0, data: results, message: 'ok' }
}

/** 检查是否已发送过，未发送则记录日志 */
async function checkAndLog(db, schedule, kind) {
  const existing = await db.collection('reminderLogs')
    .where({
      _openid: schedule._openid,
      scheduleId: schedule._id,
      kind,
      sentAt: _.gte(new Date(new Date().toISOString().slice(0, 10)))
    })
    .count()

  if (existing.total > 0) return false

  await db.collection('reminderLogs').add({
    data: {
      _openid: schedule._openid,
      scheduleId: schedule._id,
      kind,
      sentAt: db.serverDate(),
      status: 'sent'
    }
  })

  return true
}

/** 发送订阅消息（模板 ID 需在微信后台申请后配置） */
async function sendSubscribeMessage(schedule, type) {
  // 体验版阶段，订阅消息模板需要在微信后台申请
  // 申请后将模板 ID 替换下方的 TEMPLATE_ID
  // 目前仅记录日志，不实际发送
  console.log(`[reminder] ${type} for schedule ${schedule._id} at ${schedule.startTime}`)
}
