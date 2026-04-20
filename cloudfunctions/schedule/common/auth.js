/**
 * 获取当前调用者的 openid
 * 所有云函数 MUST 使用此方法获取 openid，禁止直接从 event 中取
 */
function getOpenId(cloud) {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    throw new Error('无法获取用户身份，请确保从小程序端调用')
  }

  return openid
}

module.exports = { getOpenId }
