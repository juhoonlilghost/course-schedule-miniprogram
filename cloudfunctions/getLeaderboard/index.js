const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { limit = 10 } = event
  
  try {
    const result = await db.collection('scores')
      .orderBy('score', 'desc')
      .limit(limit)
      .get()
    
    return { success: true, data: result.data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}