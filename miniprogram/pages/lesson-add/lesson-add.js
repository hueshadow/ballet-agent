const { callFunction } = require('../../utils/cloud')

const MOOD_EMOJIS = ['🥰', '😊', '😌', '😐', '😖', '😭', '💪', '✨']
const LEVELS = ['初级', '中级', '高级']

Page({
  data: {
    // 模式
    isEdit: false,
    editId: '',

    // 表单字段
    date: '',
    studioId: '',
    studioName: '',
    teacherId: '',
    teacherName: '',
    courseType: '',
    level: '',
    durationMin: 60,
    photos: [],
    notes: '',
    bodyRating: 0,
    teacherRating: 0,
    tags: [],
    tagInput: '',
    moodEmoji: '',
    paidVia: '',

    // 选项数据
    studios: [],
    teachers: [],
    filteredTeachers: [],
    courseTypes: [],
    historyTags: [],
    moodEmojis: MOOD_EMOJIS,
    levels: LEVELS,
    levelIndex: -1,

    saving: false,
    recording: false
  },

  onLoad(options) {
    const today = new Date().toISOString().slice(0, 10)
    this.setData({ date: today })

    if (options.id) {
      this.setData({ isEdit: true, editId: options.id })
      this.loadLesson(options.id)
    }

    // 模板新建：预填参数
    if (options.studioId) this.setData({ studioId: options.studioId, studioName: options.studioName || '' })
    if (options.teacherId) this.setData({ teacherId: options.teacherId, teacherName: options.teacherName || '' })
    if (options.courseType) this.setData({ courseType: options.courseType })
    if (options.durationMin) this.setData({ durationMin: parseInt(options.durationMin) || 60 })

    this.loadOptions()
  },

  async loadOptions() {
    try {
      const [studios, courseTypes, historyTags] = await Promise.all([
        callFunction('studio', { action: 'getStudios' }),
        callFunction('user', { action: 'getCourseTypes' }),
        callFunction('lesson', { action: 'getTags' })
      ])
      this.setData({ studios, courseTypes, historyTags })

      // 如果已选了机构，加载该机构老师
      if (this.data.studioId) {
        this.loadTeachers(this.data.studioId)
      }
    } catch (err) {
      console.error('加载选项失败', err)
    }
  },

  async loadTeachers(studioId) {
    try {
      const teachers = await callFunction('studio', { action: 'getTeachers', studioId })
      this.setData({ filteredTeachers: teachers })
    } catch (err) {
      console.error('加载老师失败', err)
    }
  },

  async loadLesson(id) {
    try {
      const lesson = await callFunction('lesson', { action: 'getDetail', _id: id })
      this.setData({
        date: lesson.date,
        studioId: lesson.studioId,
        studioName: lesson.studioName || '',
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName || '',
        courseType: lesson.courseType,
        level: lesson.level || '',
        levelIndex: lesson.level ? LEVELS.indexOf(lesson.level) : -1,
        durationMin: lesson.durationMin,
        photos: lesson.photos || [],
        notes: lesson.notes || '',
        bodyRating: lesson.bodyRating || 0,
        teacherRating: lesson.teacherRating || 0,
        tags: lesson.tags || [],
        moodEmoji: lesson.moodEmoji || '',
        paidVia: lesson.paidVia || ''
      })
      if (lesson.studioId) this.loadTeachers(lesson.studioId)
    } catch (err) {
      console.error('加载记录失败', err)
    }
  },

  // ===== 表单事件 =====

  onDateChange(e) { this.setData({ date: e.detail.value }) },

  onStudioChange(e) {
    const idx = e.detail.value
    const studio = this.data.studios[idx]
    this.setData({
      studioId: studio._id,
      studioName: studio.name,
      teacherId: '',
      teacherName: ''
    })
    this.loadTeachers(studio._id)
  },

  onTeacherChange(e) {
    const idx = e.detail.value
    const teacher = this.data.filteredTeachers[idx]
    this.setData({ teacherId: teacher._id, teacherName: teacher.name })
  },

  onCourseTypeChange(e) {
    const idx = e.detail.value
    this.setData({ courseType: this.data.courseTypes[idx].name })
  },

  onLevelChange(e) {
    const idx = e.detail.value
    this.setData({ level: LEVELS[idx], levelIndex: parseInt(idx) })
  },

  onDurationInput(e) {
    this.setData({ durationMin: parseInt(e.detail.value) || 60 })
  },

  onNotesInput(e) { this.setData({ notes: e.detail.value }) },

  // 照片
  onChoosePhotos() {
    const remain = 9 - this.data.photos.length
    if (remain <= 0) return
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const newPhotos = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ photos: [...this.data.photos, ...newPhotos] })
      }
    })
  },

  onRemovePhoto(e) {
    const idx = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(idx, 1)
    this.setData({ photos })
  },

  // 评分
  onBodyRating(e) {
    this.setData({ bodyRating: e.currentTarget.dataset.star })
  },

  onTeacherRatingTap(e) {
    this.setData({ teacherRating: e.currentTarget.dataset.star })
  },

  // 标签
  onTagInput(e) { this.setData({ tagInput: e.detail.value }) },

  onAddTag() {
    const { tagInput, tags } = this.data
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return
    this.setData({ tags: [...tags, tagInput.trim()], tagInput: '' })
  },

  onSelectHistoryTag(e) {
    const tag = e.currentTarget.dataset.tag
    if (!this.data.tags.includes(tag)) {
      this.setData({ tags: [...this.data.tags, tag] })
    }
  },

  onRemoveTag(e) {
    const idx = e.currentTarget.dataset.index
    const tags = [...this.data.tags]
    tags.splice(idx, 1)
    this.setData({ tags })
  },

  // Emoji
  onSelectMood(e) {
    const emoji = e.currentTarget.dataset.emoji
    this.setData({ moodEmoji: emoji === this.data.moodEmoji ? '' : emoji })
  },

  // 语音输入
  onStartRecord() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.onStop((res) => {
      this.setData({ recording: false })
      // 语音识别需微信后台配置插件，MVP 先用录音文件提示
      wx.showToast({ title: '语音识别需配置插件', icon: 'none' })
    })
    recorderManager.start({ duration: 30000, format: 'mp3' })
    this.setData({ recording: true })
  },

  onStopRecord() {
    wx.getRecorderManager().stop()
  },

  // ===== 保存 =====

  async onSave() {
    const { date, studioId, teacherId, courseType, durationMin, isEdit, editId } = this.data

    if (!studioId) { wx.showToast({ title: '请选择机构', icon: 'none' }); return }
    if (!teacherId) { wx.showToast({ title: '请选择老师', icon: 'none' }); return }
    if (!courseType) { wx.showToast({ title: '请选择课型', icon: 'none' }); return }

    this.setData({ saving: true })

    try {
      // 上传新照片
      const uploadedPhotos = []
      for (const photo of this.data.photos) {
        if (photo.startsWith('cloud://') || photo.startsWith('http')) {
          uploadedPhotos.push(photo)
        } else {
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath: `lesson-photos/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
            filePath: photo
          })
          uploadedPhotos.push(uploadRes.fileID)
        }
      }

      const params = {
        action: isEdit ? 'update' : 'add',
        date,
        studioId: this.data.studioId,
        studioName: this.data.studioName,
        teacherId: this.data.teacherId,
        teacherName: this.data.teacherName,
        courseType,
        level: this.data.level,
        durationMin,
        photos: uploadedPhotos,
        notes: this.data.notes,
        bodyRating: this.data.bodyRating,
        teacherRating: this.data.teacherRating,
        tags: this.data.tags,
        moodEmoji: this.data.moodEmoji,
        paidVia: this.data.paidVia
      }

      if (isEdit) params._id = editId

      await callFunction('lesson', params, { showLoading: true, loadingText: '保存中...' })
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          wx.switchTab({ url: '/pages/lessons/lessons' })
        }
      }, 500)
    } catch (err) {
      console.error('保存失败', err)
    } finally {
      this.setData({ saving: false })
    }
  }
})
