const app = getApp()

Page({
  data: {
    userInfo: null,
    stats: {
      totalQuestions: 0,
      correctCount: 0,
      accuracy: 0,
      streak: 0
    },
    recentSessions: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
    this.loadRecentSessions()
  },

  onShow() {
    this.loadStats()
  },

  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  loadStats() {
    wx.cloud.callFunction({
      name: 'getUserStats',
      success: res => {
        if (res.result.success) {
          this.setData({
            stats: res.result.data
          })
        }
      }
    })
  },

  loadRecentSessions() {
    wx.cloud.callFunction({
      name: 'getRecentSessions',
      success: res => {
        if (res.result.success) {
          this.setData({
            recentSessions: res.result.data
          })
        }
      }
    })
  },

  clearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有学习数据吗？此操作无法撤销。',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'clearUserData',
            success: () => {
              wx.showToast({
                title: '数据已清除',
                icon: 'success'
              })
              this.loadStats()
            }
          })
        }
      }
    })
  }
})