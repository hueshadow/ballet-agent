const { fail, ErrorCode } = require('./response')

/**
 * 云函数 action 路由分发
 *
 * 用法：
 *   const { createRouter } = require('../common/router')
 *   exports.main = createRouter({
 *     getList: async (event, openid, db) => { ... },
 *     add:     async (event, openid, db) => { ... },
 *   })
 */
function createRouter(actions) {
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

  const { getOpenId } = require('./auth')
  const db = cloud.database()

  return async (event) => {
    const { action } = event

    if (!action || !actions[action]) {
      return fail(ErrorCode.PARAM_ERROR, `未知操作: ${action || '(空)'}`)
    }

    try {
      const openid = getOpenId(cloud)
      return await actions[action](event, openid, db)
    } catch (err) {
      console.error(`[${action}] 执行错误:`, err)
      return fail(ErrorCode.SERVER_ERROR, err.message || '服务器内部错误')
    }
  }
}

module.exports = { createRouter }
