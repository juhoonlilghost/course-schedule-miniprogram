const cloud = require('wx-server-sdk');

cloud.init({
  env: 'cloud1-d4g49nkkyd53a1417'
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  return { openid: wxContext.OPENID };
};
