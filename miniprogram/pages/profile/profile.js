Page({
  data: {
    openid: '',
    env: 'cloud1-d4g49nkkyd53a1417'
  },

  onLoad() {
    this.login();
  },

  login() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      const result = res.result;
      if (result && result.openid) {
        this.setData({ openid: result.openid });
      } else {
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('login error:', err);
      wx.showToast({ title: '登录失败', icon: 'none' });
    });
  },

  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  }
});