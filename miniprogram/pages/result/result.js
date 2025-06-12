Page({
  data: {
    score: 0,
    totalQuestions: 0,
    correctCount: 0,
    accuracy: 0,
    answers: [],
    quizType: 'random',
    timeSpent: 0,
    newRecord: false
  },

  onLoad(options) {
    const answers = JSON.parse(options.answers || '[]')
    const quizType = options.type || 'random'
    
    const correctCount = answers.filter(a => a.isCorrect).length
    const totalQuestions = answers.length
    const accuracy = Math.round((correctCount / totalQuestions) * 100)
    const timeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0)

    this.setData({
      answers,
      quizType,
      correctCount,
      totalQuestions,
      accuracy,
      timeSpent,
      score: correctCount * 10
    })

    this.saveSession()
    this.checkNewRecord()
  },

  saveSession() {
    wx.cloud.callFunction({
      name: 'saveSession',
      data: {
        answers: this.data.answers,
        score: this.data.score,
        type: this.data.quizType
      }
    })
  },
  checkNewRecord() {
    wx.cloud.callFunction({
      name: 'checkRecord',
      data: {
        score: this.data.score,
        accuracy: this.data.accuracy
      },
      success: res => {
        if (res.result.isNewRecord) {
          this.setData({ newRecord: true })
        }
      }
    })
  },

  restartQuiz() {
    wx.redirectTo({
      url: `/pages/quiz/quiz?type=${this.data.quizType}`
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  reviewErrors() {
    const errorQuestions = this.data.answers.filter(a => !a.isCorrect)
    if (errorQuestions.length > 0) {
      wx.navigateTo({
        url: '/pages/error-review/error-review'
      })
    } else {
      wx.showToast({
        title: '没有错题',
        icon: 'success'
      })
    }
  },

  shareResult() {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})