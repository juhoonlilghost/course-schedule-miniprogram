// pages/rank/rank.js
Page({
  data: {
    bestScore: null,
    leaderboard: [],
    loading: true,
  },

  onLoad() {
    this.fetchAll();
  },

  onPullDownRefresh() {
    this.fetchAll();
  },

  fetchAll() {
    this.setData({ loading: true });
    Promise.all([this.fetchBestScore(), this.fetchLeaderboard()])
      .catch(() => {
        wx.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      });
  },

  fetchBestScore() {
    return wx.cloud
      .callFunction({ name: 'getUserBestScore' })
      .then((res) => {
        if (res.result && typeof res.result.score === 'number') {
          this.setData({ bestScore: res.result.score });
        } else {
          this.setData({ bestScore: 0 });
        }
      })
      .catch((err) => {
        console.warn('fetchBestScore failed:', err);
        this.setData({ bestScore: 0 });
      });
  },

  fetchLeaderboard() {
    return wx.cloud
      .callFunction({ name: 'getLeaderboard', data: { limit: 10 } })
      .then((res) => {
        if (res.result && Array.isArray(res.result.list)) {
          const list = res.result.list.map((item, index) => ({
            _id: item._id || `rank_${index}`,
            nickname: item.nickname || '匿名用户',
            score: item.score || 0,
            rank: index + 1,
          }));
          this.setData({ leaderboard: list });
        } else {
          this.setData({ leaderboard: [] });
        }
      })
      .catch((err) => {
        console.warn('fetchLeaderboard failed:', err);
        this.setData({ leaderboard: [] });
      });
  },
});
