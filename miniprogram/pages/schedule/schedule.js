const { callFunction } = require('../../utils/cloud')

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

Page({
  data: {
    // 日历
    year: 0,
    month: 0,
    calendarDays: [],
    markedDates: [],
    selectedDate: '',
    weekdays: WEEKDAYS,

    // 课程
    daySchedules: [],
    upcoming: [],
    loaded: false
  },

  onShow() {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      selectedDate: today
    })
    this.buildCalendar()
    this.loadMonth()
    this.loadUpcoming()
  },

  buildCalendar() {
    const { year, month } = this.data
    const firstDay = new Date(year, month - 1, 1)
    let startDay = firstDay.getDay() || 7 // 周一=1
    startDay -= 1

    const daysInMonth = new Date(year, month, 0).getDate()
    const days = []

    for (let i = 0; i < startDay; i++) days.push({ day: '', date: '' })
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, date })
    }

    this.setData({ calendarDays: days })
  },

  async loadMonth() {
    const { year, month } = this.data
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    try {
      const dates = await callFunction('schedule', { action: 'getMarkedDates', month: monthStr })
      this.setData({ markedDates: dates })
    } catch (err) {
      console.error('加载标记日期失败', err)
    }
  },

  async loadUpcoming() {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 7)

    try {
      const upcoming = await callFunction('schedule', {
        action: 'getList',
        startDate: today.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10)
      })
      this.setData({ upcoming, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  async onSelectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date) return

    this.setData({ selectedDate: date })

    try {
      const daySchedules = await callFunction('schedule', {
        action: 'getList',
        startDate: date,
        endDate: date
      })
      this.setData({ daySchedules })
    } catch (err) {
      this.setData({ daySchedules: [] })
    }
  },

  onPrevMonth() {
    let { year, month } = this.data
    month--
    if (month < 1) { month = 12; year-- }
    this.setData({ year, month })
    this.buildCalendar()
    this.loadMonth()
  },

  onNextMonth() {
    let { year, month } = this.data
    month++
    if (month > 12) { month = 1; year++ }
    this.setData({ year, month })
    this.buildCalendar()
    this.loadMonth()
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/schedule-form/schedule-form' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/schedule-form/schedule-form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除课程',
      content: '确认删除这条课表？',
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          await callFunction('schedule', { action: 'remove', _id: id }, { showLoading: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.onShow()
        }
      }
    })
  },

  onCreateLesson(e) {
    const s = e.currentTarget.dataset.item
    const params = [
      `studioId=${s.studioId}`,
      `studioName=${encodeURIComponent(s.studioName || '')}`,
      `teacherId=${s.teacherId || ''}`,
      `teacherName=${encodeURIComponent(s.teacherName || '')}`,
      `courseType=${encodeURIComponent(s.courseType || '')}`,
      `durationMin=${s.durationMin}`
    ].join('&')
    wx.navigateTo({ url: `/pages/lesson-add/lesson-add?${params}` })
  }
})
