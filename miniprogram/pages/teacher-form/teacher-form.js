const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    id: '',
    name: '',
    intro: '',
    avatarFileId: '',
    avatarTempUrl: '',
    studioIds: [],
    studios: [],
    saving: false,
    isEdit: false
  },

  onLoad(options) {
    this.loadStudios()
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadTeacher(options.id)
    }
  },

  async loadStudios() {
    try {
      const studios = await callFunction('studio', { action: 'getStudios' })
      this.setData({ studios })
    } catch (err) {
      console.error('加载机构列表失败', err)
    }
  },

  async loadTeacher(id) {
    try {
      const teachers = await callFunction('studio', { action: 'getTeachers' })
      const teacher = teachers.find(t => t._id === id)
      if (teacher) {
        this.setData({
          name: teacher.name,
          intro: teacher.intro || '',
          avatarFileId: teacher.avatarFileId || '',
          studioIds: teacher.studioIds || []
        })
      }
    } catch (err) {
      console.error('加载老师失败', err)
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onIntroInput(e) { this.setData({ intro: e.detail.value }) },

  onToggleStudio(e) {
    const studioId = e.currentTarget.dataset.id
    let studioIds = [...this.data.studioIds]
    const idx = studioIds.indexOf(studioId)
    if (idx >= 0) {
      studioIds.splice(idx, 1)
    } else {
      studioIds.push(studioId)
    }
    this.setData({ studioIds })
  },

  onChooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ avatarTempUrl: res.tempFiles[0].tempFilePath })
      }
    })
  },

  async onSave() {
    const { name, intro, avatarFileId, avatarTempUrl, studioIds, id, isEdit } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请填写老师名称', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    try {
      let finalAvatarFileId = avatarFileId

      if (avatarTempUrl) {
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `teacher-avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
          filePath: avatarTempUrl
        })
        finalAvatarFileId = uploadRes.fileID
      }

      const params = {
        action: isEdit ? 'updateTeacher' : 'addTeacher',
        name: name.trim(),
        studioIds,
        intro: intro.trim(),
        avatarFileId: finalAvatarFileId
      }

      if (isEdit) params._id = id

      await callFunction('studio', params, { showLoading: true })
      wx.showToast({ title: isEdit ? '已更新' : '已创建', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (err) {
      console.error('保存失败', err)
    } finally {
      this.setData({ saving: false })
    }
  }
})
