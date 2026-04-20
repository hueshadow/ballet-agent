const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    stats: null,
    loaded: false
  },

  onLoad() {
    this.loadStats()
  },

  async loadStats() {
    try {
      const stats = await callFunction('lesson', { action: 'getStats' })

      // 计算图表所需的最大值
      const maxMonthly = Math.max(...stats.monthly.map(m => m.count), 1)
      stats.monthly.forEach(m => { m.percent = Math.round((m.count / maxMonthly) * 100) })

      const maxTeacher = stats.teacherDist.length > 0 ? stats.teacherDist[0].count : 1
      stats.teacherDist.forEach(t => { t.percent = Math.round((t.count / maxTeacher) * 100) })

      const totalStudio = stats.studioDist.reduce((s, d) => s + d.count, 0) || 1
      stats.studioDist.forEach(s => { s.percent = Math.round((s.count / totalStudio) * 100) })

      const totalType = stats.typeDist.reduce((s, d) => s + d.count, 0) || 1
      stats.typeDist.forEach(t => { t.percent = Math.round((t.count / totalType) * 100) })

      this.setData({ stats, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  }
})
