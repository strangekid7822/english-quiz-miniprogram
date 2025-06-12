const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    todayQuestions: 0,
    totalQuestions: 0,
    accuracy: 0,
    streak: 0
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.loadUserStats()
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.loadUserStats()
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = res.userInfo
        this.login()
      }
    })
  },
  login() {
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo: this.data.userInfo
      },
      success: res => {
        console.log('登录成功', res)
        this.loadUserStats()
      },
      fail: err => {
        console.error('登录失败', err)
      }
    })
  },

  loadUserStats() {
    wx.cloud.callFunction({
      name: 'getUserStats',
      success: res => {
        if (res.result.success) {
          this.setData({
            todayQuestions: res.result.data.todayQuestions || 0,
            totalQuestions: res.result.data.totalQuestions || 0,
            accuracy: res.result.data.accuracy || 0,
            streak: res.result.data.streak || 0
          })
        }
      }
    })
  },

  startRandomQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz?type=random'
    })
  },

  startCategoryQuiz() {
    wx.navigateTo({
      url: '/pages/category/category'
    })
  },

  goToErrorReview() {
    wx.switchTab({
      url: '/pages/error-review/error-review'
    })
  }
})