Component({
  data: {
    selected: null, // change to null so the first setData triggers state change
    animatingIndex: null,
    list: [
      {
        pagePath: '/pages/home/home',
        text: '首页',
        iconType: 'home'
      },
      {
        pagePath: '/pages/lessons/lessons',
        text: '记录',
        iconType: 'list'
      },
      {
        pagePath: '',
        text: '打卡',
        iconType: 'add',
        isCenter: true
      },
      {
        pagePath: '/pages/moves/moves',
        text: '动作库',
        iconType: 'video'
      },
      {
        pagePath: '/pages/profile/profile',
        text: '我的',
        iconType: 'profile'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const index = data.index
      const item = this.data.list[index]

      if (item.isCenter) {
        wx.navigateTo({ url: '/pages/lesson-add/lesson-add' })
        return
      }

      wx.switchTab({ url: item.pagePath })
    }
  }
})
