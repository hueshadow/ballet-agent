const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    courseTypes: [],
    newName: '',
    loaded: false,
    initialized: false
  },

  onShow() {
    this.loadCourseTypes()
  },

  async loadCourseTypes() {
    try {
      // 首次使用时初始化预置课型
      if (!this.data.initialized) {
        await callFunction('user', { action: 'initCourseTypes' })
        this.setData({ initialized: true })
      }

      const courseTypes = await callFunction('user', { action: 'getCourseTypes' })
      this.setData({ courseTypes, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onNewNameInput(e) {
    this.setData({ newName: e.detail.value })
  },

  async onAdd() {
    const { newName } = this.data
    if (!newName.trim()) {
      wx.showToast({ title: '请输入课型名称', icon: 'none' })
      return
    }

    try {
      await callFunction('user', { action: 'addCourseType', name: newName.trim() })
      this.setData({ newName: '' })
      wx.showToast({ title: '已添加', icon: 'success' })
      this.loadCourseTypes()
    } catch (err) {
      // fail toast 已在 callFunction 中处理
    }
  },

  onDelete(e) {
    const { id, name, builtin } = e.currentTarget.dataset
    if (builtin) {
      wx.showToast({ title: '预置课型不可删除', icon: 'none' })
      return
    }

    wx.showModal({
      title: '删除课型',
      content: `确认删除「${name}」？`,
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          await callFunction('user', { action: 'deleteCourseType', _id: id })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadCourseTypes()
        }
      }
    })
  }
})
