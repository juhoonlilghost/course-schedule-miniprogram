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
    
    // 验证课程是否存在且属于当前用户
    const courseQuery = await db.collection('courses').where({
      _id: courseId,
      _openid: wxContext.OPENID
    }).get();
    
    if (courseQuery.data.length === 0) {
      return { success: false, message: '课程不存在或无权操作' };
    }
    
    // 删除课程
    await db.collection('courses').doc(courseId).remove();
    
    return { success: true, message: '删除成功' };
  } catch (err) {
    console.error('deleteCourse error:', err);
    return { success: false, message: '删除失败：' + err.message };
  }
};
