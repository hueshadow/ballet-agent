const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    studios: [],
    loaded: false
  },

  onShow() {
    this.loadStudios()
  },

  async loadStudios() {
    try {
      const studios = await callFunction('studio', { action: 'getStudios' })
      this.setData({ studios, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/studio-form/studio-form' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/studio-form/studio-form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    wx.showModal({
      title: '删除机构',
      content: `确认删除「${name}」？关联的老师不会被删除。`,
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          await callFunction('studio', { action: 'deleteStudio', _id: id }, { showLoading: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadStudios()
        }
      }
    })
  }
})
