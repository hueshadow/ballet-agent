const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

module.exports.main = createRouter({
  /** 获取当前用户档案 */
  async getProfile(event, openid, db) {
    const res = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()

    if (res.data.length === 0) {
      return success({ exists: false, profile: null })
    }

    return success({ exists: true, profile: res.data[0] })
  },

  /** 首次创建 / 更新用户档案 */
  async saveProfile(event, openid, db) {
    const { nickname, avatarUrl, danceAge, intro, goal, weeklyGoal } = event

    if (!nickname) {
      return fail(ErrorCode.PARAM_ERROR, '昵称不能为空')
    }

    const data = {
      nickname,
      avatarUrl: avatarUrl || '',
      danceAge: danceAge || 0,
      intro: intro || '',
      goal: goal || '',
      weeklyGoal: weeklyGoal || 3,
      updatedAt: db.serverDate()
    }

    const existing = await db.collection('users')
      .where({ _openid: openid })
      .limit(1)
      .get()

    if (existing.data.length === 0) {
      data._openid = openid
      data.createdAt = db.serverDate()
      data.creditBalance = 0
      await db.collection('users').add({ data })
    } else {
      await db.collection('users')
        .where({ _openid: openid })
        .update({ data })
    }

    return success(null)
  },

  // ========== 课型词典 ==========

  /** 获取课型列表（预置 + 自定义） */
  async getCourseTypes(event, openid, db) {
    // 预置课型（builtIn: true）+ 用户自定义课型
    const res = await db.collection('courseTypes')
      .where(db.command.or([
        { builtIn: true },
        { _openid: openid }
      ]))
      .orderBy('builtIn', 'desc')
      .orderBy('name', 'asc')
      .get()
    return success(res.data)
  },

  /** 初始化预置课型（仅需调用一次） */
  async initCourseTypes(event, openid, db) {
    const PRESETS = ['基训', '把杆', '中间', '跳跃', '足尖', '编舞', '汇演排练', '其他']

    const existing = await db.collection('courseTypes')
      .where({ builtIn: true })
      .count()

    if (existing.total >= PRESETS.length) {
      return success({ message: '预置课型已存在' })
    }

    for (const name of PRESETS) {
      const check = await db.collection('courseTypes')
        .where({ name, builtIn: true })
        .count()
      if (check.total === 0) {
        await db.collection('courseTypes').add({
          data: { name, builtIn: true, _openid: openid, createdAt: db.serverDate() }
        })
      }
    }

    return success({ message: '预置课型初始化完成' })
  },

  /** 用户新增自定义课型 */
  async addCourseType(event, openid, db) {
    const { name } = event
    if (!name || !name.trim()) {
      return fail(ErrorCode.PARAM_ERROR, '课型名称不能为空')
    }

    // 检查重复
    const dup = await db.collection('courseTypes')
      .where(db.command.or([
        { name: name.trim(), builtIn: true },
        { name: name.trim(), _openid: openid }
      ]))
      .count()

    if (dup.total > 0) {
      return fail(ErrorCode.DUPLICATE, '该课型已存在')
    }

    const res = await db.collection('courseTypes').add({
      data: {
        _openid: openid,
        name: name.trim(),
        builtIn: false,
        createdAt: db.serverDate()
      }
    })
    return success({ _id: res._id })
  },

  /** 删除自定义课型（预置不可删） */
  async deleteCourseType(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少课型 ID')

    const item = await db.collection('courseTypes').doc(_id).get()
    if (item.data.builtIn) {
      return fail(ErrorCode.PARAM_ERROR, '预置课型不可删除')
    }

    await db.collection('courseTypes')
      .where({ _id, _openid: openid, builtIn: false })
      .remove()
    return success(null)
  }
})
