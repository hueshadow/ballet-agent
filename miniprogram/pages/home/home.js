const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    stats: null,
    weekGoal: 3,
    loaded: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.loadData()
  },

  async loadData() {
    try {
      const [statsData, profileData] = await Promise.all([
        callFunction('lesson', { action: 'getStats' }),
        callFunction('user', { action: 'getProfile' })
      ])

      const weekGoal = (profileData.exists && profileData.profile.weeklyGoal) || 3
      this.setData({ stats: statsData, weekGoal, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onViewStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  onAddLesson() {
    wx.navigateTo({ url: '/pages/lesson-add/lesson-add' })
  }
})
