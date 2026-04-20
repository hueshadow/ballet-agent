const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    moveKey: '',
    moveInfo: null,
    checkins: [],
    loaded: false,
    compareMode: false,
    compareA: null,
    compareB: null,
    selectingSlot: '' // 'A' or 'B'
  },

  onLoad(options) {
    if (options.key) {
      this.setData({ moveKey: options.key })
    }
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      const [moves, checkins] = await Promise.all([
        callFunction('move', { action: 'getMoves' }),
        callFunction('move', { action: 'getCheckins', moveKey: this.data.moveKey })
      ])

      const moveInfo = moves.find(m => m.moveKey === this.data.moveKey)
      this.setData({ moveInfo, checkins, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onNewCheckin() {
    wx.navigateTo({ url: `/pages/move-checkin/move-checkin?key=${this.data.moveKey}` })
  },

  onStartCompare() {
    if (this.data.checkins.length < 2) {
      wx.showToast({ title: '至少需要 2 次打卡才能对比', icon: 'none' })
      return
    }
    this.setData({ compareMode: true, compareA: null, compareB: null, selectingSlot: 'A' })
  },

  onExitCompare() {
    this.setData({ compareMode: false, compareA: null, compareB: null, selectingSlot: '' })
  },

  onSelectForCompare(e) {
    const checkin = e.currentTarget.dataset.item
    const { selectingSlot } = this.data

    if (selectingSlot === 'A') {
      this.setData({ compareA: checkin, selectingSlot: 'B' })
    } else if (selectingSlot === 'B') {
      this.setData({ compareB: checkin, selectingSlot: '' })
    }
  },

  onPlayVideo(e) {
    const src = e.currentTarget.dataset.src
    wx.previewMedia({
      sources: [{ url: src, type: 'video' }]
    })
  }
})
