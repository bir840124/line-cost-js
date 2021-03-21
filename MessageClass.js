/** Message */
class MessageClass {
    constructor(bot, JianMiaubot) {
        this.bot = bot;
        this.JianMiaubot = JianMiaubot;
    }

    Message(event) {
        switch (event.message.type) {
            case 'text': {
                this.Text(event);
                break;
            }

            case 'sticker': {
                this.Sticker(event);
                break;
            }

            default:
                break;
        }
    }

    Text(event) {
        switch (event.source.type) {
            case "user": {
                this.User(event);
                break;
            }

            case "group":
                break;

            default:
                break;
        }
    }

    async Sticker(event) {
        switch (event.source.type) {
            case "user": {
                let userId = event.source.userId;
                let displayName = "";
                let profile = await this.bot.getUserProfile(userId);
                if (profile) {
                    displayName = profile.displayName;
                }
                let replyMsg = `line://app/1602687308-GXq4Vvk9?type=sticker&stk=noanim&sid=${event.message.stickerId}&pkg=${event.message.packageId}`;

                //ToJianMiau------------------------------------------------------------------------------------------------------
                if (userId !== process.env.toZhuHantoJianMiau) {
                    let ToJM_message = "已接收訊息:";
                    ToJM_message += "\ndisplayName: $displayName";
                    ToJM_message += "\nuserId: $userId";
                    ToJM_message += "\n" + replyMsg;
                    let res_toJianMiau = this.JianMiaubot.push(process.env.toJianMiau, ToJM_message);
                }
                let res_reply = event.reply(replyMsg).then(function (data) {
                    // 當訊息成功回傳後的處理
                }).catch(function (error) {
                    // 當訊息回傳失敗後的處理
                });
                break;
            }

            case "group":
                break;

            default:
                break;
        }
    }

    async User(event) {
        let userId = event.source.userId;
        let replyMsg = event.message.text;
        let displayName = "";
        let profile = await this.bot.getUserProfile(userId);
        if (profile) {
            displayName = profile.displayName;
        }
        // JianMiau特別功能
        if (userId === process.env.toJianMiau || userId === process.env.toZhuHan) {
            /** 訊息 */
            let Msg = event.message.text.split(" ");

            /** 指令 */
            let Instruction = Msg[0];
            switch (Instruction) {
                case "msg":
                case "Msg":
                case "MSG": {
                    if (userId == process.env.toZhuHantoJianMiau) {
                        if (Msg[1] === "豬涵") {
                            Msg[1] = process.env.toZhuHantoZhuHan;
                        } else if (Msg[1] === "建喵") {
                            Msg[1] = process.env.toZhuHantoJianMiau;
                        }
                        replyMsg = "";
                        for (let i = 2; i < Msg.length; i++) {
                            replyMsg += Msg[i] + (i === Msg.length - 1 ? "" : " ");
                        }
                        let res_Msg = this.bot.push(Msg[1], replyMsg);

                        let ToJM_message = "已發送訊息:";
                        ToJM_message += `\nuserId: ${Msg[1]}`;
                        ToJM_message += `\nmessage: ${replyMsg}`;
                        let res_reply = event.reply(ToJM_message).then(function (data) {
                            // 當訊息成功回傳後的處理
                        }).catch(function (error) {
                            // 當訊息回傳失敗後的處理
                        });
                    }
                    break;
                }

                default: {
                    // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
                    event.reply(replyMsg).then(function (data) {
                        // 當訊息成功回傳後的處理
                    }).catch(function (error) {
                        // 當訊息回傳失敗後的處理
                    });
                    break;
                }
            }
        }
    }
}

module.exports = MessageClass