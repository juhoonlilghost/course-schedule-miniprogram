const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const result = await db.collection('scores')
      .where({ openid: OPENID })
      .orderBy('score', 'desc')
      .limit(1)
      .get()
    
    const bestScore = result.data.length > 0 ? result.data[0].score : 0
    return { success: true, score: bestScore }
  } catch (err) {
    return { success: false, message: err.message }
  }
}