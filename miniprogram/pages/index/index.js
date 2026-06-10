Page({
  data: {
    courseList: [],
    dayTabs: ['全部', '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    currentTab: 0,
    loading: false
  },

  onLoad() {
    this.loadCourseList();
  },

  onPullDownRefresh() {
    this.loadCourseList();
  },

  // 切换星期Tab
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    this.loadCourseList();
  },

  // 加载课程列表
  loadCourseList() {
    this.setData({ loading: true });
    
    const dayOfWeek = this.data.currentTab === 0 ? null : this.data.currentTab;
    
    wx.cloud.callFunction({
      name: 'getCourseList',
      data: { dayOfWeek }
    }).then(res => {
      const result = res.result;
      if (result && result.success) {
        // 按星期分组
        const groupedCourses = this.groupCoursesByDay(result.data);
        this.setData({ courseList: groupedCourses });
      } else {
        const errMsg = result && result.message ? result.message : '云函数未部署，请先上传云函数';
        wx.showToast({ title: errMsg, icon: 'none', duration: 3000 });
        console.warn('loadCourseList failed:', result);
      }
    }).catch(err => {
      console.error('loadCourseList error:', err);
      const errCode = err.errCode || '';
      if (errCode === -501000 || (err.errMsg && err.errMsg.includes('FUNCTION_NOT_FOUND'))) {
        wx.showToast({ title: '云函数未部署，请右键 cloudfunctions 目录上传', icon: 'none', duration: 3000 });
      } else {
        wx.showToast({ title: '加载失败: ' + (err.errMsg || ''), icon: 'none', duration: 3000 });
      }
    }).finally(() => {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    });
  },

  // 按星期分组课程
  groupCoursesByDay(courses) {
    const groups = {};
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    // 初始化所有星期的空数组
    for (let i = 1; i <= 7; i++) {
      groups[i] = { dayName: dayNames[i - 1], courses: [] };
    }
    
    // 将课程分配到对应的星期
    courses.forEach(course => {
      if (groups[course.dayOfWeek]) {
        groups[course.dayOfWeek].courses.push(course);
      }
    });
    
    // 根据当前筛选条件过滤
    if (this.data.currentTab === 0) {
      return Object.values(groups).filter(g => g.courses.length > 0);
    } else {
      return [groups[this.data.currentTab]];
    }
  },

  // 点击课程卡片
  onCourseTap(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${courseId}`
    });
  },

  // 添加课程
  onAddCourse() {
    wx.navigateTo({
      url: '/pages/add-course/add-course'
    });
  }
});
