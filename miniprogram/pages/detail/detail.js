Page({
  data: {
    course: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadCourseDetail(options.id);
    }
  },

  // 加载课程详情
  loadCourseDetail(courseId) {
    wx.showLoading({ title: '加载中' });
    
    wx.cloud.callFunction({
      name: 'getCourseDetail',
      data: { courseId }
    }).then(res => {
      const result = res.result;
      if (result.success) {
        this.setData({ course: result.data });
      } else {
        wx.showToast({ title: result.message, icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }).catch(err => {
      console.error('loadCourseDetail error:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  // 编辑课程
  onEdit() {
    wx.navigateTo({
      url: `/pages/add-course/add-course?id=${this.data.course._id}`
    });
  },

  // 删除课程
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这门课程吗？删除后无法恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.deleteCourse();
        }
      }
    });
  },

  // 执行删除
  deleteCourse() {
    wx.showLoading({ title: '删除中' });
    
    wx.cloud.callFunction({
      name: 'deleteCourse',
      data: { courseId: this.data.course._id }
    }).then(res => {
      const result = res.result;
      if (result.success) {
        wx.showToast({ title: result.message, icon: 'success' });
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2];
            if (prevPage && prevPage.loadCourseList) {
              prevPage.loadCourseList();
            }
          }
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: result.message, icon: 'none' });
      }
    }).catch(err => {
      console.error('deleteCourse error:', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }).finally(() => {
      wx.hideLoading();
    });
  }
});
