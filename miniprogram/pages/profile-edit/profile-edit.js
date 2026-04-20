const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    mode: 'edit',
    nickname: '',
    avatarUrl: '',
    danceAge: '',
    intro: '',
    goal: '',
    weeklyGoal: 3,
    saving: false
  },

  onLoad(options) {
    const mode = options.mode || 'edit'
    this.setData({ mode })

    if (mode === 'edit') {
      this.loadProfile()
    }
  },

  async loadProfile() {
    try {
      const res = await callFunction('user', { action: 'getProfile' })
      if (res.exists) {
        const p = res.profile
        this.setData({
          nickname: p.nickname || '',
          avatarUrl: p.avatarUrl || '',
          danceAge: p.danceAge || '',
          intro: p.intro || '',
          goal: p.goal || '',
          weeklyGoal: p.weeklyGoal || 3
        })
      }
    } catch (err) {
      console.error('加载档案失败', err)
    }
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (avatarUrl) {
      this.setData({ avatarUrl })
    }
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onDanceAgeInput(e) {
    this.setData({ danceAge: parseInt(e.detail.value) || '' })
  },

  onIntroInput(e) {
    this.setData({ intro: e.detail.value })
  },

  onGoalInput(e) {
    this.setData({ goal: e.detail.value })
  },

  onWeeklyGoalChange(e) {
    this.setData({ weeklyGoal: parseInt(e.detail.value) || 3 })
  },

  async onSave() {
    const { nickname, avatarUrl, danceAge, intro, goal, weeklyGoal, mode } = this.data

    if (!nickname.trim()) {
      wx.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    try {
      let finalAvatarUrl = avatarUrl

      if (avatarUrl && avatarUrl.startsWith('wxfile://')) {
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
          filePath: avatarUrl
        })
        finalAvatarUrl = uploadRes.fileID
      }

      await callFunction('user', {
        action: 'saveProfile',
        nickname: nickname.trim(),
        avatarUrl: finalAvatarUrl,
        danceAge: parseInt(danceAge) || 0,
        intro: intro.trim(),
        goal: goal.trim(),
        weeklyGoal: parseInt(weeklyGoal) || 3
      }, { showLoading: true, loadingText: '保存中...' })

      wx.showToast({ title: '保存成功', icon: 'success' })

      setTimeout(() => {
        if (mode === 'init') {
          wx.switchTab({ url: '/pages/home/home' })
        } else {
          wx.navigateBack()
        }
      }, 500)
    } catch (err) {
      console.error('保存失败', err)
    } finally {
      this.setData({ saving: false })
    }
  }
})
