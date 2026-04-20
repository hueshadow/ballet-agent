const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    moveKey: '',
    videoTempPath: '',
    videoDuration: 0,
    selfRating: 0,
    notes: '',
    saving: false
  },

  onLoad(options) {
    if (options.key) {
      this.setData({ moveKey: options.key })
    }
  },

  onChooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 300,
      camera: 'back',
      success: (res) => {
        const file = res.tempFiles[0]
        this.setData({
          videoTempPath: file.tempFilePath,
          videoDuration: Math.round(file.duration || 0)
        })
      }
    })
  },

  onRating(e) {
    this.setData({ selfRating: e.currentTarget.dataset.star })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  async onSave() {
    const { moveKey, videoTempPath, videoDuration, selfRating, notes } = this.data

    if (!videoTempPath) {
      wx.showToast({ title: '请先选择视频', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    try {
      // 上传视频
      wx.showLoading({ title: '上传视频中...', mask: true })
      const videoRes = await wx.cloud.uploadFile({
        cloudPath: `move-videos/${moveKey}-${Date.now()}.mp4`,
        filePath: videoTempPath
      })
      wx.hideLoading()

      // 保存打卡记录
      await callFunction('move', {
        action: 'addCheckin',
        moveKey,
        videoFileId: videoRes.fileID,
        videoDurationSec: videoDuration,
        thumbFileId: '',
        selfRating,
        notes: notes.trim()
      }, { showLoading: true, loadingText: '保存中...' })

      wx.showToast({ title: '打卡成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (err) {
      wx.hideLoading()
      console.error('保存失败', err)
    } finally {
      this.setData({ saving: false })
    }
  }
})
