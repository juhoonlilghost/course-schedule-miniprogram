Page({
  data: {
    courseId: '',
    isEdit: false,
    form: {
      courseName: '',
      teacher: '',
      location: '',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:40',
      remark: ''
    },
    dayOptions: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({ courseId: options.id, isEdit: true });
      wx.setNavigationBarTitle({ title: '编辑课程' });
      this.loadCourseDetail(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '添加课程' });
    }
  },

  // 加载课程详情（编辑模式）
  loadCourseDetail(courseId) {
    wx.showLoading({ title: '加载中' });
    
    wx.cloud.callFunction({
      name: 'getCourseDetail',
      data: { courseId }
    }).then(res => {
      const result = res.result;
      if (result.success) {
        this.setData({ form: result.data });
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

  // 表单输入处理
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`form.${field}`]: value });
  },

  // 星期选择
  onDayChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({ 'form.dayOfWeek': index + 1 });
  },

  // 开始时间选择
  onStartTimeChange(e) {
    this.setData({ 'form.startTime': e.detail.value });
  },

  // 结束时间选择
  onEndTimeChange(e) {
    this.setData({ 'form.endTime': e.detail.value });
  },

  // 表单校验
  validateForm() {
    const { courseName, teacher, location, dayOfWeek, startTime, endTime } = this.data.form;
    
    if (!courseName || courseName.trim().length === 0) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' });
      return false;
    }
    if (!teacher || teacher.trim().length === 0) {
      wx.showToast({ title: '请输入教师姓名', icon: 'none' });
      return false;
    }
    if (!location || location.trim().length === 0) {
      wx.showToast({ title: '请输入上课地点', icon: 'none' });
      return false;
    }
    if (startTime >= endTime) {
      wx.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 保存课程
  onSave() {
    if (!this.validateForm()) return;
    
    wx.showLoading({ title: '保存中' });
    
    const form = this.data.form;
    const cloudData = {
      courseName: form.courseName.trim(),
      teacher: form.teacher.trim(),
      location: form.location.trim(),
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      remark: form.remark ? form.remark.trim() : ''
    };
    
    const cloudName = this.data.isEdit ? 'updateCourse' : 'addCourse';
    const data = this.data.isEdit ? { ...cloudData, courseId: this.data.courseId } : cloudData;
    
    console.log('调用云函数:', cloudName, data);
    
    wx.cloud.callFunction({
      name: cloudName,
      data: data
    }).then(res => {
      console.log('云函数返回:', res);
      const result = res.result;
      if (result && result.success) {
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
        const errMsg = result && result.message ? result.message : '云函数未部署，请先上传云函数';
        wx.showToast({ title: errMsg, icon: 'none', duration: 3000 });
        console.warn('保存失败:', result);
      }
    }).catch(err => {
      console.error('saveCourse error:', err);
      const errCode = err.errCode || '';
      if (errCode === -501000 || (err.errMsg && err.errMsg.includes('FUNCTION_NOT_FOUND'))) {
        wx.showToast({ title: '云函数未部署，请在云函数目录右键上传', icon: 'none', duration: 3000 });
      } else if (err.errMsg && err.errMsg.includes('permission')) {
        wx.showToast({ title: '数据库权限错误，请检查集合权限设置', icon: 'none', duration: 3000 });
      } else {
        wx.showToast({ title: '保存失败: ' + (err.errMsg || '未知错误'), icon: 'none', duration: 3000 });
      }
    }).finally(() => {
      wx.hideLoading();
    });
  },

  // 取消
  onCancel() {
    wx.navigateBack();
  }
});
