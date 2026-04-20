const { createRouter } = require('../common/router')
const { success } = require('../common/response')

/**
 * 示例云函数 - 验证基建可用
 * 调用方式：wx.cloud.callFunction({ name: 'ping', data: { action: 'ping' } })
 */
module.exports.main = createRouter({
  async ping(event, openid, db) {
    const count = await db.collection('users')
      .where({ _openid: openid })
      .count()

    return success({
      openid,
      timestamp: Date.now(),
      userExists: count.total > 0
    })
  }
})
