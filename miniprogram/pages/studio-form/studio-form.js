const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    id: '',
    name: '',
    city: '',
    address: '',
    logoFileId: '',
    logoTempUrl: '',
    saving: false,
    isEdit: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadStudio(options.id)
    }
  },

  async loadStudio(id) {
    try {
      const studios = await callFunction('studio', { action: 'getStudios' })
      const studio = studios.find(s => s._id === id)
      if (studio) {
        this.setData({
          name: studio.name,
          city: studio.city || '',
          address: studio.address || '',
          logoFileId: studio.logoFileId || ''
        })
      }
    } catch (err) {
      console.error('加载机构失败', err)
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onCityInput(e) { this.setData({ city: e.detail.value }) },
  onAddressInput(e) { this.setData({ address: e.detail.value }) },

  onChooseLogo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        this.setData({ logoTempUrl: res.tempFiles[0].tempFilePath })
      }
    })
  },

  async onSave() {
    const { name, city, address, logoFileId, logoTempUrl, id, isEdit } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请填写机构名称', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    try {
      let finalLogoFileId = logoFileId

      if (logoTempUrl) {
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
          filePath: logoTempUrl
        })
        finalLogoFileId = uploadRes.fileID
      }

      const params = {
        action: isEdit ? 'updateStudio' : 'addStudio',
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        logoFileId: finalLogoFileId
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
