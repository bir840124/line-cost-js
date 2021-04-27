// 背景執行 forever start -a -l line-cost-js.log app.js
// npm start
// npm run dev
// Debug nodemon --inspect=192.168.168.15:9229 app.js

const dateFormat = require('dateformat');
const { decode } = require('querystring');
const Tools_MYSQLDBClass = require('./Tools_MYSQLDBClass');
const MessageClass = require('./MessageClass');
const PostbackClass = require('./PostbackClass');
const CPBLClass = require('./CPBLClass');

/** LineBot */
class LineBotClass {
    constructor(path, port, credentials, bot, JianMiaubot) {
        let self = this;
        this.bot = bot;
        this.JianMiaubot = JianMiaubot;
        this.Tools_MYSQLDB = new Tools_MYSQLDBClass();
        this.Message = new MessageClass(this);
        this.Postback = new PostbackClass(this);
        this.CPBL = new CPBLClass(this);

        // 當有人傳送訊息給Bot時
        bot.on('event', function (event) {
            switch (event.type) {
                case 'message': {
                    self.Message.Message(event);
                    break;
                }

                case 'postback': {
                    self.Postback.Postback(event);
                    break;
                }

                case 'join':
                case 'leave':
                case 'follow':
                case 'unfollow':
                case 'memberJoin':
                case 'memberLeave':
                case 'accountLink':
                case 'fallback':
                default:
                    break;
            }
        });
        bot.listen(path, port, credentials, function () {
            let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            console.log(`${datetime} listening on ${port}`);
            console.log(`${datetime} [BOT已準備就緒]`);
            // Tools_MYSQLDB.readData();
        });
    }
}

module.exports = LineBotClass