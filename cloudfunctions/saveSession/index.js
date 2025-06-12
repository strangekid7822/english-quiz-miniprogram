const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { answers, score, type } = event

  try {
    const session = await db.collection('sessions').add({
      data: {
        userId: wxContext.OPENID,
        questions: answers.map(a => a.questionId),
        score,
        type,
        startTime: new Date(Date.now() - answers.reduce((sum, a) => sum + a.timeSpent, 0) * 1000),
        endTime: new Date(),
        createTime: new Date()
      }
    })

    return { success: true, sessionId: session._id }
  } catch (err) {
    console.error(err)
    return { success: false, error: err }
  }
}