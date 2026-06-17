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

    // 数据校验
    const validation = validateCourseData(event);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const now = Date.now();

    // 添加课程，必须手动带上 _openid，云函数不会自动注入
    const result = await db.collection('courses').add({
      data: {
        _openid: wxContext.OPENID,
        courseName: event.courseName.trim(),
        teacher: event.teacher.trim(),
        location: event.location.trim(),
        dayOfWeek: Number(event.dayOfWeek),
        startTime: event.startTime,
        endTime: event.endTime,
        remark: event.remark || '',
        createTime: now,
        updateTime: now
      }
    });

    return { success: true, message: '添加成功', data: { _id: result._id } };
  } catch (err) {
    console.error('addCourse error:', err);
    return { success: false, message: '添加失败：' + err.message };
  }
};
