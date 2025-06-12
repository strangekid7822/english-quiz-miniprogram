Page({
  data: {
    categories: [
      { id: 'grammar', name: '语法', icon: '📖', desc: '时态、语态、句型结构' },
      { id: 'vocabulary', name: '词汇', icon: '📝', desc: '单词辨析、短语搭配' },
      { id: 'reading', name: '阅读理解', icon: '📚', desc: '文章理解、逻辑推理' },
      { id: 'listening', name: '听力', icon: '🎧', desc: '对话理解、听力填空' },
      { id: 'writing', name: '写作', icon: '✍️', desc: '句子翻译、作文技巧' },
      { id: 'speaking', name: '口语', icon: '🗣️', desc: '发音、对话练习' }
    ]
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/quiz/quiz?type=category&category=${category}`
    })
  }
})