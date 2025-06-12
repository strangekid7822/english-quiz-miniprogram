Page({
  data: {
    errorQuestions: [],
    loading: true,
    currentIndex: 0,
    showAnswer: false
  },

  onLoad() {
    this.loadErrorQuestions()
  },

  onShow() {
    this.loadErrorQuestions()
  },

  loadErrorQuestions() {
    wx.cloud.callFunction({
      name: 'getErrorQuestions',
      success: res => {
        if (res.result.success) {
          this.setData({
            errorQuestions: res.result.data,
            loading: false,
            currentIndex: 0,
            showAnswer: false
          })
        }
      },
      fail: err => {
        console.error('加载错题失败', err)
        this.setData({ loading: false })
      }
    })
  },

  showAnswer() {
    this.setData({ showAnswer: true })
  },
  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex >= this.data.errorQuestions.length) {
      wx.showToast({
        title: '已是最后一题',
        icon: 'none'
      })
      return
    }
    this.setData({
      currentIndex: nextIndex,
      showAnswer: false
    })
  },

  prevQuestion() {
    if (this.data.currentIndex <= 0) {
      wx.showToast({
        title: '已是第一题',
        icon: 'none'
      })
      return
    }
    this.setData({
      currentIndex: this.data.currentIndex - 1,
      showAnswer: false
    })
  },

  startPractice() {
    wx.navigateTo({
      url: '/pages/quiz/quiz?type=error'
    })
  }
})