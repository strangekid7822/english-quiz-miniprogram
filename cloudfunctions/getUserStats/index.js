const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户基本信息
    const userQuery = await db.collection('users').where({
      openId: wxContext.OPENID
    }).get()

    if (userQuery.data.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const user = userQuery.data[0]
    
    // 获取今日答题数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayRecords = await db.collection('records').where({
      userId: wxContext.OPENID,
      timestamp: db.command.gte(today)
    }).count()

    // 计算连续天数
    const streak = await calculateStreak(wxContext.OPENID)
    
    // 计算准确率
    const accuracy = user.totalQuestions > 0 
      ? Math.round((user.correctCount / user.totalQuestions) * 100)
      : 0

    return {
      success: true,
      data: {
        todayQuestions: todayRecords.total,
        totalQuestions: user.totalQuestions,
        accuracy,
        streak
      }
    }
  } catch (err) {
    console.error(err)
    return { success: false, error: err }
  }
}
async function calculateStreak(openId) {
  const records = await db.collection('records')
    .where({ userId: openId })
    .orderBy('timestamp', 'desc')
    .get()

  if (records.data.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  const dayGroups = {}
  records.data.forEach(record => {
    const date = new Date(record.timestamp)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.getTime()
    dayGroups[dateKey] = true
  })

  const sortedDays = Object.keys(dayGroups)
    .map(Number)
    .sort((a, b) => b - a)

  for (let day of sortedDays) {
    if (day === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (day === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}