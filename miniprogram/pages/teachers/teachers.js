const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    teachers: [],
    studios: [],
    filterStudioId: '',
    loaded: false
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      const [teachers, studios] = await Promise.all([
        callFunction('studio', { action: 'getTeachers' }),
        callFunction('studio', { action: 'getStudios' })
      ])
      this.setData({ teachers, studios, loaded: true })
    } catch (err) {
      this.setData({ loaded: true })
    }
  },

  onFilterChange(e) {
    const studioId = e.detail.value === '0' ? '' : this.data.studios[e.detail.value - 1]._id
    this.setData({ filterStudioId: studioId })
  },

  get filteredTeachers() {
    const { teachers, filterStudioId } = this.data
    if (!filterStudioId) return teachers
    return teachers.filter(t => t.studioIds && t.studioIds.includes(filterStudioId))
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/teacher-form/teacher-form' })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/teacher-form/teacher-form?id=${id}` })
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    wx.showModal({
      title: '删除老师',
      content: `确认删除「${name}」？`,
      confirmColor: '#ff3b30',
      success: async (res) => {
        if (res.confirm) {
          await callFunction('studio', { action: 'deleteTeacher', _id: id }, { showLoading: true })
          wx.showToast({ title: '已删除', icon: 'success' })
          this.loadData()
        }
      }
    })
  },

  getStudioNames(studioIds) {
    if (!studioIds || studioIds.length === 0) return ''
    return studioIds
      .map(id => {
        const s = this.data.studios.find(s => s._id === id)
        return s ? s.name : ''
      })
      .filter(Boolean)
      .join('、')
  }
})
