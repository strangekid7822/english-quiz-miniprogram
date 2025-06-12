const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { questionId, userAnswer, isCorrect, timeSpent } = event

  try {
    // 保存答题记录
    await db.collection('records').add({
      data: {
        userId: wxContext.OPENID,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
        timestamp: new Date()
      }
    })

    // 更新用户统计
    const userQuery = await db.collection('users').where({
      openId: wxContext.OPENID
    }).get()

    if (userQuery.data.length > 0) {
      const user = userQuery.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          totalQuestions: user.totalQuestions + 1,
          correctCount: user.correctCount + (isCorrect ? 1 : 0)
        }
      })
    }

    return {
      success: true
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}