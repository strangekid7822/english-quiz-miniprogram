const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type = 'random', count = 10 } = event

  try {
    let questions = []

    if (type === 'random') {
      // 获取推荐题目
      questions = await getRecommendedQuestions(wxContext.OPENID, count)
    } else if (type === 'category') {
      // 分类练习
      const { category } = event
      const result = await db.collection('questions')
        .where({ category })
        .orderBy('difficulty', 'asc')
        .limit(count)
        .get()
      questions = result.data
    } else if (type === 'error') {
      // 错题重练
      questions = await getErrorQuestions(wxContext.OPENID, count)
    }

    return {
      success: true,
      data: questions
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}
// 推荐算法实现
async function getRecommendedQuestions(openId, count) {
  // 获取用户历史答题记录
  const records = await db.collection('records')
    .where({ userId: openId })
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get()

  const userHistory = records.data

  // 分析薄弱知识点
  const weakCategories = analyzeWeakness(userHistory)
  
  // 获取适配难度的题目
  const difficulty = calculateUserLevel(userHistory)
  
  // 构建推荐查询
  const query = db.collection('questions')
    .where({
      difficulty: db.command.gte(difficulty - 1).and(db.command.lte(difficulty + 1))
    })
    .limit(count * 2)

  const questionPool = await query.get()
  
  // 应用推荐权重选择题目
  return selectByWeights(questionPool.data, weakCategories, count)
}

async function getErrorQuestions(openId, count) {
  const errorRecords = await db.collection('records')
    .where({
      userId: openId,
      isCorrect: false
    })
    .orderBy('timestamp', 'desc')
    .limit(count)
    .get()

  const questionIds = errorRecords.data.map(r => r.questionId)
  
  const questions = await db.collection('questions')
    .where({
      _id: db.command.in(questionIds)
    })
    .get()

  return questions.data
}
function analyzeWeakness(history) {
  const categoryStats = {}
  
  history.forEach(record => {
    if (!categoryStats[record.category]) {
      categoryStats[record.category] = { total: 0, correct: 0 }
    }
    categoryStats[record.category].total++
    if (record.isCorrect) {
      categoryStats[record.category].correct++
    }
  })
  
  // 返回准确率最低的分类
  return Object.keys(categoryStats)
    .sort((a, b) => {
      const aRate = categoryStats[a].correct / categoryStats[a].total
      const bRate = categoryStats[b].correct / categoryStats[b].total
      return aRate - bRate
    })
    .slice(0, 3)
}

function calculateUserLevel(history) {
  if (history.length === 0) return 2
  
  const recentAccuracy = history.slice(0, 20).filter(r => r.isCorrect).length / Math.min(20, history.length)
  
  if (recentAccuracy > 0.8) return Math.min(5, 3 + 1)
  if (recentAccuracy > 0.6) return 3
  if (recentAccuracy > 0.4) return 2
  return 1
}

function selectByWeights(questions, weakCategories, count) {
  // 应用推荐权重
  const weighted = questions.map(q => ({
    ...q,
    weight: weakCategories.includes(q.category) ? 1.5 : 1.0
  }))
  
  // 随机选择并返回
  return weighted
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}