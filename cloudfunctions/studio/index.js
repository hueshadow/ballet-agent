const { createRouter } = require('./common/router')
const { success, fail, ErrorCode } = require('./common/response')

module.exports.main = createRouter({
  // ========== 机构 ==========

  async getStudios(event, openid, db) {
    const res = await db.collection('studios')
      .where({ _openid: openid })
      .orderBy('name', 'asc')
      .get()
    return success(res.data)
  },

  async addStudio(event, openid, db) {
    const { name, city, address, logoFileId } = event
    if (!name || !name.trim()) {
      return fail(ErrorCode.PARAM_ERROR, '机构名称不能为空')
    }
    const data = {
      _openid: openid,
      name: name.trim(),
      city: (city || '').trim(),
      address: (address || '').trim(),
      logoFileId: logoFileId || '',
      createdAt: db.serverDate()
    }
    const res = await db.collection('studios').add({ data })
    return success({ _id: res._id })
  },

  async updateStudio(event, openid, db) {
    const { _id, name, city, address, logoFileId } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少机构 ID')
    if (!name || !name.trim()) return fail(ErrorCode.PARAM_ERROR, '机构名称不能为空')

    await db.collection('studios')
      .where({ _id, _openid: openid })
      .update({
        data: {
          name: name.trim(),
          city: (city || '').trim(),
          address: (address || '').trim(),
          logoFileId: logoFileId || '',
          updatedAt: db.serverDate()
        }
      })
    return success(null)
  },

  async deleteStudio(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少机构 ID')

    await db.collection('studios')
      .where({ _id, _openid: openid })
      .remove()

    // 解除关联的老师
    const _ = db.command
    await db.collection('teachers')
      .where({ _openid: openid, studioIds: _id })
      .update({ data: { studioIds: _.pull(_id) } })

    return success(null)
  },

  // ========== 老师 ==========

  async getTeachers(event, openid, db) {
    const { studioId } = event
    const where = { _openid: openid }
    if (studioId) {
      where.studioIds = studioId
    }
    const res = await db.collection('teachers')
      .where(where)
      .orderBy('name', 'asc')
      .get()
    return success(res.data)
  },

  async addTeacher(event, openid, db) {
    const { name, studioIds, intro, avatarFileId } = event
    if (!name || !name.trim()) {
      return fail(ErrorCode.PARAM_ERROR, '老师名称不能为空')
    }
    const data = {
      _openid: openid,
      name: name.trim(),
      studioIds: studioIds || [],
      intro: (intro || '').trim(),
      avatarFileId: avatarFileId || '',
      createdAt: db.serverDate()
    }
    const res = await db.collection('teachers').add({ data })
    return success({ _id: res._id })
  },

  async updateTeacher(event, openid, db) {
    const { _id, name, studioIds, intro, avatarFileId } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少老师 ID')
    if (!name || !name.trim()) return fail(ErrorCode.PARAM_ERROR, '老师名称不能为空')

    await db.collection('teachers')
      .where({ _id, _openid: openid })
      .update({
        data: {
          name: name.trim(),
          studioIds: studioIds || [],
          intro: (intro || '').trim(),
          avatarFileId: avatarFileId || '',
          updatedAt: db.serverDate()
        }
      })
    return success(null)
  },

  async deleteTeacher(event, openid, db) {
    const { _id } = event
    if (!_id) return fail(ErrorCode.PARAM_ERROR, '缺少老师 ID')

    await db.collection('teachers')
      .where({ _id, _openid: openid })
      .remove()
    return success(null)
  }
})
