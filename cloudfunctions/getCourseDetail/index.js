const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const courseId = event.courseId;
    
    if (!courseId) {
      return { success: false, message: '课程ID不能为空' };
    }
    
    // 查询课程详情，验证属于当前用户
    const result = await db.collection('courses')
      .where({
        _id: courseId,
        _openid: wxContext.OPENID
      })
      .get();
    
    if (result.data.length === 0) {
      return { success: false, message: '课程不存在或无权查看' };
    }
    
    return { success: true, data: result.data[0] };
  } catch (err) {
    console.error('getCourseDetail error:', err);
    return { success: false, message: '获取课程详情失败：' + err.message };
  }
};
