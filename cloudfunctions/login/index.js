const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event

  try {
    // 查找用户是否已存在
    const userQuery = await db.collection('users').where({
      openId: wxContext.OPENID
    }).get()

    if (userQuery.data.length === 0) {
      // 新用户，创建记录
      await db.collection('users').add({
        data: {
          openId: wxContext.OPENID,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          grade: 1,
          totalQuestions: 0,
          correctCount: 0,
          lastLoginTime: new Date(),
          createTime: new Date()
        }
      })
    } else {
      // 更新登录时间
      await db.collection('users').doc(userQuery.data[0]._id).update({
        data: {
          lastLoginTime: new Date(),
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      })
    }

    return {
      success: true,
      openId: wxContext.OPENID
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}