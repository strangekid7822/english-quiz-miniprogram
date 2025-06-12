const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    await db.collection('records').where({
      userId: wxContext.OPENID
    }).remove()

    await db.collection('sessions').where({
      userId: wxContext.OPENID
    }).remove()

    await db.collection('users').where({
      openId: wxContext.OPENID
    }).update({
      data: {
        totalQuestions: 0,
        correctCount: 0,
        bestScore: 0,
        bestAccuracy: 0
      }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}