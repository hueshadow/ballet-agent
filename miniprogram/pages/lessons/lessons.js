const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    lessons: [],
    studios: [],
    teachers: [],
    courseTypes: [],
    loaded: false,

    // 筛选
    filterStudioId: '',
    filterTeacherId: '',
    filterCourseType: '',
    filterMonth: '',
    filterMood: '',
    keyword: '',
    showFilter: false
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadData()
  },

  async loadData() {
    try {
      const [studios, courseTypes] = await Promise.all([
        callFunction('studio', { action: 'getStudios' }),
        callFunction('user', { action: 'getCourseTypes' })
      ])
      this.setData({ studios, courseTypes })
      this.loadLessons()
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  async loadLessons() {
    const params = { action: 'getList', limit: 100 }
    if (this.data.filterStudioId) params.studioId = this.data.filterStudioId
    if (this.data.filterTeacherId) params.teacherId = this.data.filterTeacherId
    if (this.data.filterCourseType) params.courseType = this.data.filterCourseType
    if (this.data.filterMonth) params.month = this.data.filterMonth
    if (this.data.filterMood) params.moodEmoji = this.data.filterMood
    if (this.data.keyword.trim()) params.keyword = this.data.keyword.trim()

    try {
      const lessons = await callFunction('lesson', params)
      this.setData({ lessons, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onToggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  onFilterStudio(e) {
    const idx = e.detail.value
    this.setData({ filterStudioId: idx === '0' ? '' : this.data.studios[idx - 1]._id })
    this.loadLessons()
  },

  onFilterCourseType(e) {
    const idx = e.detail.value
    this.setData({ filterCourseType: idx === '0' ? '' : this.data.courseTypes[idx - 1].name })
    this.loadLessons()
  },

  onFilterMonth(e) {
    this.setData({ filterMonth: e.detail.value })
    this.loadLessons()
  },

  onClearFilters() {
    this.setData({
      filterStudioId: '', filterTeacherId: '', filterCourseType: '',
      filterMonth: '', filterMood: '', keyword: ''
    })
    this.loadLessons()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadLessons()
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/lesson-detail/lesson-detail?id=${id}` })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/lesson-add/lesson-add' })
  }
})
