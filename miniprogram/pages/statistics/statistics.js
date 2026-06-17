Page({
  data: {
    stats: null,
    loading: false,
    empty: false
  },

  onLoad() {
    this.getStatistics();
  },

  getStatistics() {
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getStatistics'
    }).then(res => {
      const result = res.result;
      if (result && result.success) {
        const data = result.data;
        const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const maxCount = Math.max(...data.dayDistribution, 1);
        const dayDistribution = data.dayDistribution.map((count, index) => ({
          day: dayNames[index],
          count: count,
          percent: (count / maxCount) * 100
        }));
        this.setData({
          stats: {
            totalCourses: data.courseCount,
            totalHours: data.totalWeeklyHours,
            teacherCount: data.teacherCount,
            dayDistribution: dayDistribution
          },
          empty: data.courseCount === 0
        });
      } else {
        wx.showToast({ title: result.message || '获取统计失败', icon: 'none' });
        this.setData({ empty: true });
      }
    }).catch(err => {
      console.error('getStatistics error:', err);
      wx.showToast({ title: '获取统计失败', icon: 'none' });
      this.setData({ empty: true });
    }).finally(() => {
      this.setData({ loading: false });
    });
  }
});