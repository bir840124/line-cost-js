const dateFormat = require('dateformat');
const { decode } = require('querystring');

/** Postback */
class PostbackClass {
    constructor(app) {
        this.app = app;
    }

    Postback(event) {
        let action = event.postback.data;
        let data = decode(action);
        switch (data["action"]) {
            case 'nogame': {
                this.NoGame(event, data);
                break;
            }

            case 'hasgame': {
                this.HasGame(event, data);
                break;
            }

            default:
                break;
        }
    }

    NoGame(event, data) {
        let replyMsg = `比賽還沒開始\n時間是${data["game_date"]} ${data["time"]}`;
        if (event) {
            event.reply(replyMsg).then(function (data) {
                // 當訊息成功回傳後的處理
            }).catch(function (error) {
                // 當訊息回傳失敗後的處理
            });
        }
    }

    HasGame(event, data) {
        this.app.CPBL.AddTime({
            game_id: data["game_id"],
            cpbldata: data,
            LineID: event.source.userId
        }, event);
    }
}

module.exports = PostbackClass