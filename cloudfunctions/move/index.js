const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

/** 10 个预置芭蕾动作 */
const PRESET_MOVES = [
  { key: 'plie', cn: '蹲', fr: 'Plié', pron: 'plee-AY', desc: '双腿弯曲下蹲，保持背部挺直，膝盖对准脚尖方向。芭蕾最基础的动作之一。' },
  { key: 'tendu', cn: '擦地', fr: 'Tendu', pron: 'tahn-DÜ', desc: '脚沿地面向前/侧/后滑出伸直，脚尖不离地。训练脚背力量和腿部控制。' },
  { key: 'degage', cn: '小踢腿', fr: 'Dégagé', pron: 'day-ga-ZHAY', desc: '类似 Tendu 但脚尖离地约 25°。强调快速有力的脚部动作。' },
  { key: 'rondDejambe', cn: '划圈', fr: 'Rond de jambe', pron: 'rohn duh ZHAHMB', desc: '工作腿在地面或空中画半圆。训练髋关节外旋和腿部协调。' },
  { key: 'frappe', cn: '弹动', fr: 'Frappé', pron: 'fra-PAY', desc: '工作脚从弯曲位置快速弹出伸直。训练脚踝力量和速度。' },
  { key: 'fondu', cn: '融化', fr: 'Fondu', pron: 'fohn-DÜ', desc: '支撑腿缓慢弯曲同时工作腿展开，如同融化般流畅。训练控制力。' },
  { key: 'developpe', cn: '控腿', fr: 'Développé', pron: 'dayv-law-PAY', desc: '工作腿从 passé 位置缓慢展开至前/侧/后。考验腿部力量和柔韧性。' },
  { key: 'grandBattement', cn: '大踢腿', fr: 'Grand battement', pron: 'grahn bat-MAHN', desc: '工作腿大幅度踢起。训练腿部爆发力和髋关节灵活性。' },
  { key: 'releve', cn: '上升', fr: 'Relevé', pron: 'ruh-luh-VAY', desc: '从全脚掌上升至半脚尖或全脚尖。训练小腿力量和平衡。' },
  { key: 'pirouette', cn: '旋转（单圈）', fr: 'Pirouette', pron: 'peer-oo-ET', desc: '单腿支撑原地旋转一圈。综合考验平衡、力量和协调。' }
]

module.exports.main = createRouter({
  /** 初始化预置动作（仅需调用一次） */
  async initMoves(event, openid, db) {
    const existing = await db.collection('moveAssets').count()
    if (existing.total >= PRESET_MOVES.length) {
      return success({ message: '预置动作已存在' })
    }

    for (const move of PRESET_MOVES) {
      const check = await db.collection('moveAssets').where({ moveKey: move.key }).count()
      if (check.total === 0) {
        await db.collection('moveAssets').add({
          data: {
            moveKey: move.key,
            cn: move.cn,
            fr: move.fr,
            pron: move.pron,
            desc: move.desc,
            referenceImageFileId: ''
          }
        })
      }
    }

    return success({ message: '预置动作初始化完成' })
  },

  /** 获取所有动作（含打卡统计） */
  async getMoves(event, openid, db) {
    const assets = await db.collection('moveAssets').get()

    // 获取该用户的所有打卡记录统计
    const checkins = await db.collection('moveCheckins')
      .where({ _openid: openid })
      .field({ moveKey: true, date: true })
      .orderBy('date', 'desc')
      .limit(500)
      .get()

    const statsMap = {}
    checkins.data.forEach(c => {
      if (!statsMap[c.moveKey]) {
        statsMap[c.moveKey] = { count: 0, lastDate: c.date }
      }
      statsMap[c.moveKey].count++
    })

    const today = new Date().toISOString().slice(0, 10)
    const moves = assets.data.map(a => {
      const stat = statsMap[a.moveKey] || { count: 0, lastDate: '' }
      const daysSince = stat.lastDate
        ? Math.max(0, Math.floor((new Date(today) - new Date(stat.lastDate)) / 86400000))
        : -1
      return { ...a, checkinCount: stat.count, daysSinceLast: daysSince }
    })

    return success(moves)
  },

  /** 获取单个动作的打卡时间线 */
  async getCheckins(event, openid, db) {
    const { moveKey } = event
    if (!moveKey) return fail(ErrorCode.PARAM_ERROR, '缺少动作 key')

    const res = await db.collection('moveCheckins')
      .where({ _openid: openid, moveKey })
      .orderBy('date', 'desc')
      .limit(100)
      .get()

    return success(res.data)
  },

  /** 新增打卡 */
  async addCheckin(event, openid, db) {
    const { moveKey, videoFileId, videoDurationSec, thumbFileId, selfRating, notes } = event

    if (!moveKey || !videoFileId) {
      return fail(ErrorCode.PARAM_ERROR, '缺少动作或视频')
    }

    const data = {
      _openid: openid,
      moveKey,
      videoFileId,
      videoDurationSec: videoDurationSec || 0,
      thumbFileId: thumbFileId || '',
      date: new Date().toISOString().slice(0, 10),
      selfRating: selfRating || 0,
      notes: (notes || '').trim(),
      createdAt: db.serverDate()
    }

    const res = await db.collection('moveCheckins').add({ data })
    return success({ _id: res._id })
  },

  /** 删除打卡 */
  async removeCheckin(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少记录 ID')

    await db.collection('moveCheckins')
      .where({ _id, _openid: openid })
      .remove()
    return success(null)
  }
})
