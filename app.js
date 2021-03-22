// 背景執行 forever start -w app.js
// 監聽檔案變化 nodemon "npm start"
// Debug node --inspect=192.168.168.15:9229 app.js

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

const Tools_MYSQLDBClass = require('./Tools_MYSQLDBClass');
const MessageClass = require('./MessageClass');

const Tools_MYSQLDB = new Tools_MYSQLDBClass();
const Message = new MessageClass(bot, JianMiaubot, Tools_MYSQLDB);

// Bot所監聽的webhook路徑與port
const path = process.env.URLPATH || "/";
const port = process.env.PORT || 3001;

// 當有人傳送訊息給Bot時
bot.on('event', function (event) {
  switch (event.type) {
    case 'message': {
      Message.Message(event);
      break;
    }

    case 'join':
    case 'leave':
    case 'follow':
    case 'unfollow':
    case 'memberJoin':
    case 'memberLeave':
    case 'postback':
    case 'accountLink':
    case 'fallback':
    default:
      break;
  }
});
bot.listen(path, port, credentials, function () {
  console.log(`listening on ${port}`);
  console.log('[BOT已準備就緒]');
  // Tools_MYSQLDB.readData();
});