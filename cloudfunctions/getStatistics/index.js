const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    // 查询该用户的所有课程
    const result = await db.collection('courses')
      .where({ _openid: openid })
      .get();

    const courses = result.data;
    const courseCount = courses.length;

    // 初始化星期分布数组（索引 0-6 对应周一到周日）
    const dayDistribution = [0, 0, 0, 0, 0, 0, 0];

    const teachers = new Set();
    let totalWeeklyHours = 0;

    for (const course of courses) {
      // 统计星期分布
      const dayIndex = Number(course.dayOfWeek) - 1;
      if (dayIndex >= 0 && dayIndex <= 6) {
        dayDistribution[dayIndex]++;
      }

      // 统计教师
      if (course.teacher) {
        teachers.add(course.teacher);
      }

      // 计算课时（简单按小时差计算）
      if (course.startTime && course.endTime) {
        const startHour = parseInt(course.startTime.split(':')[0], 10);
        const endHour = parseInt(course.endTime.split(':')[0], 10);
        if (!isNaN(startHour) && !isNaN(endHour)) {
          totalWeeklyHours += (endHour - startHour);
        }
      }
    }

    return {
      success: true,
      data: {
        courseCount,
        dayDistribution,
        totalWeeklyHours,
        teacherCount: teachers.size
      }
    };
  } catch (err) {
    console.error('getStatistics error:', err);
    return { success: false, message: '获取统计数据失败：' + err.message };
  }
};
