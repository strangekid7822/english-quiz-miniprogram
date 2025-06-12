const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { score, accuracy } = event

  try {
    const userQuery = await db.collection('users').where({
      openId: wxContext.OPENID
    }).get()

    if (userQuery.data.length === 0) {
      return { success: false, isNewRecord: false }
    }

    const user = userQuery.data[0]
    const currentBest = user.bestScore || 0
    const currentAccuracy = user.bestAccuracy || 0

    const isNewRecord = score > currentBest || accuracy > currentAccuracy

    if (isNewRecord) {
      await db.collection('users').doc(user._id).update({
        data: {
          bestScore: Math.max(currentBest, score),
          bestAccuracy: Math.max(currentAccuracy, accuracy)
        }
      })
    }

    return { success: true, isNewRecord }
  } catch (err) {
    return { success: false, error: err }
  }
}