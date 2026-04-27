const { callFunction } = require('../../utils/cloud')

const REPEAT_RULES = ['不重复', '每周', '隔周']
const REPEAT_VALUES = ['none', 'weekly', 'biweekly']

Page({
  data: {
    id: '',
    isEdit: false,
    date: '',
    startTime: '19:00',
    durationMin: 90,
    studioId: '',
    studioName: '',
    teacherId: '',
    teacherName: '',
    courseType: '',
    repeatRule: 'none',
    repeatIndex: 0,
    reminderLeadMin: 30,
    studios: [],
    filteredTeachers: [],
    courseTypes: [],
    repeatRules: REPEAT_RULES,
    saving: false
  },

  onLoad(options) {
    const today = new Date().toISOString().slice(0, 10)
    this.setData({ date: today })
    this.loadOptions()

    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadSchedule(options.id)
    }
  },

  async loadOptions() {
    try {
      const [studios, courseTypes] = await Promise.all([
        callFunction('studio', { action: 'getStudios' }),
        callFunction('user', { action: 'getCourseTypes' })
      ])
      this.setData({ studios, courseTypes })
    } catch (err) {
      console.error('加载选项失败', err)
    }
  },

  async loadSchedule(id) {
    try {
      const list = await callFunction('schedule', {
        action: 'getList',
        startDate: '2000-01-01',
        endDate: '2099-12-31'
      })
      const item = list.find(s => s._id === id)
      if (item) {
        this.setData({
          date: item.date,
          startTime: item.startTime,
          durationMin: item.durationMin,
          studioId: item.studioId,
          studioName: item.studioName || '',
          teacherId: item.teacherId || '',
          teacherName: item.teacherName || '',
          courseType: item.courseType || '',
          repeatRule: item.repeatRule || 'none',
          repeatIndex: REPEAT_VALUES.indexOf(item.repeatRule || 'none'),
          reminderLeadMin: item.reminderLeadMin || 30
        })
        if (item.studioId) this.loadTeachers(item.studioId)
      }
    } catch (err) {
      console.error('加载课表失败', err)
    }
  },

  async loadTeachers(studioId) {
    try {
      const teachers = await callFunction('studio', { action: 'getTeachers', studioId })
      this.setData({ filteredTeachers: teachers })
    } catch (err) {}
  },

  onDateChange(e) { this.setData({ date: e.detail.value }) },
  onTimeChange(e) { this.setData({ startTime: e.detail.value }) },
  onDurationInput(e) { this.setData({ durationMin: parseInt(e.detail.value) || 60 }) },
  onReminderInput(e) { this.setData({ reminderLeadMin: parseInt(e.detail.value) || 30 }) },

  onStudioChange(e) {
    const studio = this.data.studios[e.detail.value]
    this.setData({ studioId: studio._id, studioName: studio.name, teacherId: '', teacherName: '' })
    this.loadTeachers(studio._id)
  },

  onTeacherChange(e) {
    const teacher = this.data.filteredTeachers[e.detail.value]
    this.setData({ teacherId: teacher._id, teacherName: teacher.name })
  },

  onCourseTypeChange(e) {
    this.setData({ courseType: this.data.courseTypes[e.detail.value].name })
  },

  onRepeatChange(e) {
    const idx = parseInt(e.detail.value)
    this.setData({ repeatRule: REPEAT_VALUES[idx], repeatIndex: idx })
  },

  async onSave() {
    const { studioId, date, startTime, isEdit, id } = this.data

    if (!studioId) { wx.showToast({ title: '请选择机构', icon: 'none' }); return }

    this.setData({ saving: true })

    try {
      const params = {
        action: isEdit ? 'update' : 'add',
        date,
        startTime,
        durationMin: this.data.durationMin,
        studioId,
        studioName: this.data.studioName,
        teacherId: this.data.teacherId,
        teacherName: this.data.teacherName,
        courseType: this.data.courseType,
        repeatRule: this.data.repeatRule,
        reminderLeadMin: this.data.reminderLeadMin
      }
      if (isEdit) params._id = id

      await callFunction('schedule', params, { showLoading: true })

      const count = isEdit ? 1 : (this.data.repeatRule === 'none' ? 1 : 12)
      wx.showToast({ title: `已${isEdit ? '更新' : '创建'} ${count} 条`, icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (err) {
      console.error('保存失败', err)
    } finally {
      this.setData({ saving: false })
    }
  }
})
