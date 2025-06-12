const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const sessions = await db.collection('sessions')
      .where({ userId: wxContext.OPENID })
      .orderBy('createTime', 'desc')
      .limit(10)
      .get()

    return {
      success: true,
      data: sessions.data.map(s => ({
        ...s,
        createTime: new Date(s.createTime).toLocaleDateString()
      }))
    }
  } catch (err) {
    return { success: false, error: err }
  }
}