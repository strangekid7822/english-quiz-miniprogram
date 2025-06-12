const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const errorRecords = await db.collection('records')
      .where({
        userId: wxContext.OPENID,
        isCorrect: false
      })
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()

    const questionIds = [...new Set(errorRecords.data.map(r => r.questionId))]
    
    if (questionIds.length === 0) {
      return { success: true, data: [] }
    }

    const questions = await db.collection('questions')
      .where({
        _id: db.command.in(questionIds)
      })
      .get()

    return {
      success: true,
      data: questions.data
    }
  } catch (err) {
    console.error(err)
    return { success: false, error: err }
  }
}