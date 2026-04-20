/**
 * 云函数调用封装
 * 统一处理 loading、错误提示、返回值解包
 */

function callFunction(name, data, options = {}) {
  const { showLoading = false, loadingText = '加载中...' } = options

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true })
  }

  return wx.cloud.callFunction({ name, data })
    .then(res => {
      if (showLoading) wx.hideLoading()

      const result = res.result
      if (result.code !== 0) {
        console.warn(`[${name}/${data.action}] 业务错误:`, result.message)
        if (options.showError !== false) {
          wx.showToast({ title: result.message, icon: 'none' })
        }
        return Promise.reject(result)
      }

      return result.data
    })
    .catch(err => {
      if (showLoading) wx.hideLoading()

      if (err.code !== undefined) throw err

      console.error(`[${name}] 调用失败:`, err)
      if (options.showError !== false) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
      throw err
    })
}

module.exports = { callFunction }
