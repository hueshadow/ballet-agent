const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    moves: [],
    loaded: false,
    initialized: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    this.loadMoves()
  },

  async loadMoves() {
    try {
      if (!this.data.initialized) {
        await callFunction('move', { action: 'initMoves' })
        this.setData({ initialized: true })
      }

      const moves = await callFunction('move', { action: 'getMoves' })
      this.setData({ moves, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onViewDetail(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({ url: `/pages/move-detail/move-detail?key=${key}` })
  }
})
