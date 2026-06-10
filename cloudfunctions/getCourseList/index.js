const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const dayOfWeek = event.dayOfWeek;
    
    // 构建查询条件
    let query = { _openid: wxContext.OPENID };
    
    // 如果指定了星期，则按星期筛选
    if (dayOfWeek && dayOfWeek >= 1 && dayOfWeek <= 7) {
      query.dayOfWeek = dayOfWeek;
    }
    
    // 查询课程列表，按星期和开始时间排序
    const result = await db.collection('courses')
      .where(query)
      .orderBy('dayOfWeek', 'asc')
      .orderBy('startTime', 'asc')
      .get();
    
    return { success: true, data: result.data };
  } catch (err) {
    console.error('getCourseList error:', err);
    return { success: false, message: '获取课程列表失败：' + err.message };
  }
};
