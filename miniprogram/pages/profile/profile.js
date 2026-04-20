const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    profile: null,
    loaded: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const res = await callFunction('user', { action: 'getProfile' })
      if (!res.exists) {
        wx.navigateTo({ url: '/pages/profile-edit/profile-edit?mode=init' })
        return
      }
      this.setData({ profile: res.profile, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit?mode=edit' })
  },

  onManageStudios() {
    wx.navigateTo({ url: '/pages/studios/studios' })
  },

  onManageTeachers() {
    wx.navigateTo({ url: '/pages/teachers/teachers' })
  },

  onManageCourseTypes() {
    wx.navigateTo({ url: '/pages/course-types/course-types' })
  },

  onImportCSV() {
    wx.navigateTo({ url: '/pages/csv-import/csv-import' })
  },

  async onExportJSON() {
    wx.showLoading({ title: '导出中...', mask: true })

    try {
      const res = await callFunction('data', { action: 'exportAll' }, { showError: true })

      wx.hideLoading()

      const summary = Object.entries(res.collections)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => `${name}: ${count}`)
        .join('\n')

      wx.showModal({
        title: `导出成功（${res.totalRecords} 条）`,
        content: summary + '\n\nJSON 文件已保存到云存储',
        showCancel: false
      })
    } catch (err) {
      wx.hideLoading()
    }
  }
})
