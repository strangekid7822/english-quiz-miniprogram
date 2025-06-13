const app = getApp()

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selectedAnswer: '',
    showResult: false,
    isCorrect: false,
    timeSpent: 0,
    startTime: 0,
    answers: [],
    quizType: 'random',
    loading: true
  },

  onLoad(options) {
    this.setData({
      quizType: options.type || 'random'
    })
    this.loadQuestions()
  },

  loadQuestions() {
    // Mock questions for testing
    const mockQuestions = [
      {
        _id: 'q1',
        content: 'Which sentence is correct?',
        options: [
          { label: 'A', text: 'I am going' },
          { label: 'B', text: 'I am go' }
        ],
        answer: 'A'
      },
      {
        _id: 'q2', 
        content: 'Past tense of run?',
        options: [
          { label: 'A', text: 'runned' },
          { label: 'B', text: 'ran' }
        ],
        answer: 'B'
      }
    ]
    
    this.setData({
      questions: mockQuestions,
      currentQuestion: mockQuestions[0],
      loading: false,
      startTime: Date.now()
    })
  },
  selectAnswer(e) {
    const answer = e.currentTarget.dataset.answer
    this.setData({
      selectedAnswer: answer
    })
  },

  submitAnswer() {
    if (!this.data.selectedAnswer) {
      wx.showToast({
        title: '请选择答案',
        icon: 'none'
      })
      return
    }

    const isCorrect = this.data.selectedAnswer === this.data.currentQuestion.answer
    const timeSpent = Math.floor((Date.now() - this.data.startTime) / 1000)

    this.setData({
      showResult: true,
      isCorrect: isCorrect,
      timeSpent: timeSpent
    })

    // 记录答题结果
    this.data.answers.push({
      questionId: this.data.currentQuestion._id,
      userAnswer: this.data.selectedAnswer,
      isCorrect: isCorrect,
      timeSpent: timeSpent
    })

    // 提交答案到云端
    wx.cloud.callFunction({
      name: 'submitAnswer',
      data: {
        questionId: this.data.currentQuestion._id,
        userAnswer: this.data.selectedAnswer,
        isCorrect: isCorrect,
        timeSpent: timeSpent
      }
    })
  },
  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1
    
    if (nextIndex >= this.data.questions.length) {
      // 练习结束，跳转到结果页
      wx.redirectTo({
        url: `/pages/result/result?answers=${JSON.stringify(this.data.answers)}&type=${this.data.quizType}`
      })
      return
    }

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      selectedAnswer: '',
      showResult: false,
      startTime: Date.now()
    })
  },

  exitQuiz() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前练习吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },

  getProgress() {
    return Math.round(((this.data.currentIndex + 1) / this.data.questions.length) * 100)
  }
})