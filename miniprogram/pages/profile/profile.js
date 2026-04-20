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
  }
})
