const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 数据校验
function validateCourseData(data) {
  const { courseName, teacher, location, dayOfWeek, startTime, endTime } = data;
  
  if (!courseName || courseName.trim().length === 0) {
    return { valid: false, message: '课程名称不能为空' };
  }
  if (courseName.length > 50) {
    return { valid: false, message: '课程名称不能超过50个字符' };
  }
  if (!teacher || teacher.trim().length === 0) {
    return { valid: false, message: '教师不能为空' };
  }
  if (teacher.length > 30) {
    return { valid: false, message: '教师姓名不能超过30个字符' };
  }
  if (!location || location.trim().length === 0) {
    return { valid: false, message: '上课地点不能为空' };
  }
  if (location.length > 100) {
    return { valid: false, message: '上课地点不能超过100个字符' };
  }
  if (!dayOfWeek || dayOfWeek < 1 || dayOfWeek > 7) {
    return { valid: false, message: '星期必须是1-7之间的数字' };
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return { valid: false, message: '开始时间格式错误，应为HH:mm' };
  }
  if (!endTime || !/^\d{2}:\d{2}$/.test(endTime)) {
    return { valid: false, message: '结束时间格式错误，应为HH:mm' };
  }
  if (startTime >= endTime) {
    return { valid: false, message: '结束时间必须晚于开始时间' };
  }
  
  return { valid: true };
}

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const courseId = event.courseId;
    
    if (!courseId) {
      return { success: false, message: '课程ID不能为空' };
    }
    
    // 数据校验
    const validation = validateCourseData(event);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    // 验证课程是否存在且属于当前用户
    const courseQuery = await db.collection('courses').where({
      _id: courseId,
      _openid: wxContext.OPENID
    }).get();
    
    if (courseQuery.data.length === 0) {
      return { success: false, message: '课程不存在或无权操作' };
    }
    
    const now = Date.now();
    
    // 更新课程
    await db.collection('courses').doc(courseId).update({
      data: {
        courseName: event.courseName.trim(),
        teacher: event.teacher.trim(),
        location: event.location.trim(),
        dayOfWeek: Number(event.dayOfWeek),
        startTime: event.startTime,
        endTime: event.endTime,
        remark: event.remark || '',
        updateTime: now
      }
    });
    
    return { success: true, message: '更新成功' };
  } catch (err) {
    console.error('updateCourse error:', err);
    return { success: false, message: '更新失败：' + err.message };
  }
};
