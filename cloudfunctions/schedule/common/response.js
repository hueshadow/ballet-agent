/**
 * 统一响应格式
 * 所有云函数返回 { code, data, message }
 */

function success(data) {
  return { code: 0, data, message: 'ok' }
}

function fail(code, message) {
  return { code, data: null, message }
}

/** 错误码定义 */
const ErrorCode = {
  PARAM_ERROR: 1001,
  NOT_FOUND: 1002,
  AUTH_FAILED: 1003,
  DUPLICATE: 1004,
  LIMIT_EXCEEDED: 1005,
  SERVER_ERROR: 2001
}

module.exports = { success, fail, ErrorCode }
