const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 数据库集合初始化脚本
 * 在微信开发者工具中手动调用一次，创建所有集合
 *
 * 集合说明：
 * - users:         用户档案（头像、昵称、舞龄、目标、周目标、V2积分余额）
 * - studios:       机构（名称、城市、地址、logo）
 * - teachers:      老师（名称、所属机构、简介、头像）
 * - courseTypes:    课型词典（名称、是否预置）
 * - lessons:       上课记录（日期、机构、老师、课型、时长、照片、笔记、评分、标签…）
 * - moveCheckins:  动作打卡（动作key、视频、封面、自评、笔记）
 * - moveAssets:    预置动作资产（动作key、示范图）
 * - dailySigns:    AI日签（日期、课时ID、图片、文案、来源）
 * - schedules:     课表（日期时间、机构、老师、课型、重复规则、提醒配置）
 * - reminderLogs:  提醒日志（课表ID、类型、发送时间、状态）
 */

const COLLECTIONS = [
  'users',
  'studios',
  'teachers',
  'courseTypes',
  'lessons',
  'moveCheckins',
  'moveAssets',
  'dailySigns',
  'schedules',
  'reminderLogs'
]

exports.main = async (event) => {
  const results = []

  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name)
      results.push({ collection: name, status: 'created' })
    } catch (err) {
      if (err.errCode === -502005) {
        results.push({ collection: name, status: 'already_exists' })
      } else {
        results.push({ collection: name, status: 'error', message: err.message })
      }
    }
  }

  return { code: 0, data: results, message: 'ok' }
}
