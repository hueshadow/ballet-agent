const { callFunction } = require('../../utils/cloud')
const { getTodayTerm } = require('../../utils/terms')

Page({
  data: {
    stats: null,
    weekGoal: 3,
    loaded: false,
    heatmapWeeks: [],
    todayTerm: null,
    termLearned: false
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

      // 热力图数据分组为周（每 7 天一组）
      const heatmapWeeks = []
      const h = statsData.heatmap || []
      for (var i = 0; i < h.length; i += 7) {
        heatmapWeeks.push(h.slice(i, i + 7))
      }

      // 今日术语
      const todayTerm = getTodayTerm()
      const learnedKey = 'term_learned_' + new Date().toISOString().slice(0, 10)
      const termLearned = wx.getStorageSync(learnedKey) || false

      this.setData({ stats: statsData, weekGoal, loaded: true, heatmapWeeks, todayTerm, termLearned })
    } catch (err) {
      // 即使云函数失败，也加载术语卡片
      const todayTerm = getTodayTerm()
      const learnedKey = 'term_learned_' + new Date().toISOString().slice(0, 10)
      const termLearned = wx.getStorageSync(learnedKey) || false
      this.setData({ loaded: true, todayTerm, termLearned })
    }
  },

  onMarkTermLearned() {
    const learnedKey = 'term_learned_' + new Date().toISOString().slice(0, 10)
    wx.setStorageSync(learnedKey, true)
    this.setData({ termLearned: true })
  },

  onViewStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  onAddLesson() {
    wx.navigateTo({ url: '/pages/lesson-add/lesson-add' })
  }
})
