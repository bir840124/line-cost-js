// 背景執行 forever start -a -l line-cost-js.log app.js
// 重新背景執行 forever restart -a -l line-cost-js.log app.js
// npm start
// npm run dev
// Debug nodemon --inspect=192.168.168.15:9229 app.js

const dateFormat = require('dateformat');
require('dotenv').config()
// require("./plug/DateFormat");
// 引用linebot SDK
var linebot = require('linebot');
const fs = require('fs');

//讀取憑證及金鑰
const prikey = fs.readFileSync('privkey.pem', 'utf8');
const cert = fs.readFileSync('cert.pem', 'utf8');
const cafile = fs.readFileSync('chain.pem', 'utf-8');

//建立憑證及金鑰
const credentials = {
  key: prikey,
  cert: cert,
  ca: cafile
};

// 用於辨識Line Channel的資訊
var bot = linebot({
  channelId: process.env.toZhuHantoJianMiau,
  channelSecret: process.env.ZhuHanchannelSecret,
  channelAccessToken: process.env.ZhuHanchannelAccessToken
});
var JianMiaubot = linebot({
  channelId: process.env.toJianMiau,
  channelSecret: process.env.channelSecret,
  channelAccessToken: process.env.channelAccessToken
});

const LineBotAPI = require('./LineBotClass');

// Bot所監聽的webhook路徑與port
const path = process.env.URLPATH || "/";
const port = process.env.PORT || 3001;

new LineBotAPI(path, port, credentials, bot, JianMiaubot);

// // 當有人傳送訊息給Bot時
// bot.on('event', function (event) {
//   switch (event.type) {
//     case 'message': {
//       Message.Message(event);
//       break;
//     }

//     case 'postback': {
//       Postback.Postback(this, event);
//       break;
//     }

//     case 'join':
//     case 'leave':
//     case 'follow':
//     case 'unfollow':
//     case 'memberJoin':
//     case 'memberLeave':
//     case 'accountLink':
//     case 'fallback':
//     default:
//       break;
//   }
// });
// bot.listen(path, port, credentials, function () {
//   let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
//   console.log(`${datetime} listening on ${port}`);
//   console.log(`${datetime} [BOT已準備就緒]`);
//   // Tools_MYSQLDB.readData();
// });