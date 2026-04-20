const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    lesson: null,
    id: '',
    loaded: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
    }
  },

  onShow() {
    if (this.data.id) {
      this.loadDetail(this.data.id)
    }
  },

  async loadDetail(id) {
    try {
      const lesson = await callFunction('lesson', { action: 'getDetail', _id: id })
      this.setData({ lesson, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onPreviewImage(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.lesson.photos || []
    })
  },

  onEdit() {
    wx.navigateTo({ url: `/pages/lesson-add/lesson-add?id=${this.data.id}` })
  },

  onDelete() {
    wx.showModal({
      title: '删除记录',
      content: '确认删除这条上课记录？此操作不可撤销。',
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          await callFunction('lesson', { action: 'remove', _id: this.data.id }, { showLoading: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 500)
        }
      }
    })
  },

  onGenerateSign() {
    wx.navigateTo({ url: `/pages/sign-preview/sign-preview?lessonId=${this.data.id}` })
  },

  onCopyAsTemplate() {
    const l = this.data.lesson
    const params = [
      `studioId=${l.studioId}`,
      `studioName=${encodeURIComponent(l.studioName || '')}`,
      `teacherId=${l.teacherId}`,
      `teacherName=${encodeURIComponent(l.teacherName || '')}`,
      `courseType=${encodeURIComponent(l.courseType)}`,
      `durationMin=${l.durationMin}`
    ].join('&')
    wx.navigateTo({ url: `/pages/lesson-add/lesson-add?${params}` })
  }
})
