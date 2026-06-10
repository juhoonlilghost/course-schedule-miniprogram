const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { score } = event
  
  if (typeof score !== 'number' || score < 0) {
    return { success: false, message: 'Invalid score' }
  }
  
  try {
    await db.collection('scores').add({
      data: {
        openid: OPENID,
        score: score,
        date: db.serverDate(),
      },
    })
    return { success: true, message: 'Score saved' }
  } catch (err) {
    return { success: false, message: err.message }
  }
}