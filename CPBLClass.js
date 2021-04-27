const dateFormat = require('dateformat');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const schedule = require('node-schedule');
const { decode } = require('querystring');

/** CPBL */
class CPBLClass {
    constructor(app) {
        this.app = app;
        this.TimeList = [];
        // var rule = new schedule.RecurrenceRule();
        // // rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        // rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        // // console.log(`設定任務 每${JSON.stringify(rule.minute)}分鐘 現在時間: ` + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
        // console.log(`設定任務 每${JSON.stringify(rule.second)}秒鐘 現在時間: ` + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
        // this.Timer = schedule.scheduleJob(rule, this.Update.bind(this));
    }

    async Update() {
        // let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        // console.log("執行任務 現在時間: " + datetime);
        // if (dateFormat(new Date(), "ss") === "00") {
        //     this.Timer.cancel();
        //     // console.log("取消任務 現在時間: " + datetime);
        // }
        if (this.TimeList.length > 0) {
            for (let i = 0; i < this.TimeList.length; i++) {
                this.RunTime(this.TimeList[i]);
            }
        } else {
            this.CloseTime();
        }
    }

    async AddTime(Data, event) {
        let game_id = Data["game_id"];
        let cpbldata = Data["cpbldata"];
        let LineID = Data["LineID"];

        let Isgame_id = false;
        let IsLineID = false;
        let Time = {
            game_id: game_id,
            cpbldata: cpbldata,
            LineID: [LineID]
        }
        for (let i = 0; i < this.TimeList.length; i++) {
            if (this.TimeList[i]["game_id"] === game_id) {
                Isgame_id = true;
                Time = this.TimeList[i];
                for (let j = 0; j < this.TimeList[i]["LineID"].length; j++) {
                    if (this.TimeList[i]["LineID"][j] === LineID) {
                        IsLineID = true;
                        break;
                    }
                }
                break;
            }
        }
        let IsRUN = true;
        let Response = await this.GetCPBL(Time);
        if (Response[Response.length - 1]["title"].indexOf("比賽結束") !== -1) {
            IsRUN = false;
        }
        let replyMsg = "";
        for (let i = 0; i < Response.length; i++) {
            replyMsg += Response[i]["title"];
            if (i !== Response.length - 1) {
                replyMsg += "\n\n";
            }
        }
        if (IsRUN) {
            if (!Isgame_id) {
                // 沒有這場賽事
                if (this.TimeList.length === 0) {
                    this.StartTime();
                }
                this.TimeList.push(Time);
            } else if (Isgame_id && !IsLineID) {
                // 有這場賽事但沒這個帳號
                Time["LineID"].push(LineID);
            }
            let Extra = {
                cpbldata: cpbldata,
                count: Response.length
            }
            let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            let Query = `UPDATE \`line-cost-status\` SET \`datetime\`='${datetime}', \`Status\`='CPBL RUN', \`Extra\`='${JSON.stringify(Extra)}' WHERE (\`userid\`='${LineID}');`;
            let res_Query = await this.app.Tools_MYSQLDB.Query(Query);
        } else {
            replyMsg += "\n\n已停止中職轉播功能";
        }
        if (event) {
            event.reply(replyMsg).then(function (data) {
                // 當訊息成功回傳後的處理
            }).catch(function (error) {
                // 當訊息回傳失敗後的處理
            });
        }
    }

    StartTime() {
        // var rule = '0 1 * * * *';
        // *  *  *  *  *  *
        // ┬  ┬  ┬  ┬  ┬  ┬
        // │  │  │  │  │  |
        // │  │  │  │  │  └ 星期几，取值：0 - 7，其中 0 和 7 都表示是周日
        // │  │  │  │  └─── 月份，取值：1 - 12
        // │  │  │  └────── 日期，取值：1 - 31
        // │  │  └───────── 时，取值：0 - 23
        // │  └──────────── 分，取值：0 - 59
        // └─────────────── 秒，取值：0 - 59（可选）
        var rule = new schedule.RecurrenceRule();
        let minute = 2;
        let minute_arr = [];
        for (let i = 0; i < 60; i++) {
            if (i % minute === 0) {
                minute_arr.push(i);
            }
        }
        rule.minute = minute_arr;
        // rule.second = [0];
        // rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        // console.log(`設定任務 每${JSON.stringify(rule.minute)}分鐘 現在時間: ` + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
        // console.log(`設定任務 每${JSON.stringify(rule.second)}秒鐘 現在時間: ` + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"));
        this.Timer = schedule.scheduleJob(rule, this.Update.bind(this));
    }

    CloseTime() {
        this.Timer.cancel();
    }

    async GetCPBL(Time) {
        let game_id = Time["game_id"];
        let cpbldata = Time["cpbldata"];
        let LineID = Time["LineID"];
        let url = "https://jianmiau.ml:3333/CPBL";
        let Data = {
            URL: `http://www.cpbl.com.tw/games/play_by_play.html?&game_type=${cpbldata["game_type"]}&game_id=${cpbldata["game_id"]}&game_date=${cpbldata["game_date"]}&pbyear=${cpbldata["pbyear"]}`
        };
        let Response = await this.GetData(url, Data);
        Response = [].concat.apply([], JSON.parse(Response));
        return new Promise((resolve, reject) => {
            // 傳入 resolve 與 reject，表示資料成功與失敗
            resolve(Response);
            // reject()
        });
    }

    DelTime(game_id) {
        for (let i = 0; i < this.TimeList.length; i++) {
            if (this.TimeList[i]["game_id"] === game_id) {
                this.TimeList.splice(i, 1);
                if (this.TimeList.length === 0) {
                    this.CloseTime();
                }
            }
        }
    }

    async RunTime(Time) {
        let game_id = Time["game_id"];
        let cpbldata = Time["cpbldata"];
        let LineID = Time["LineID"];
        let url = "https://jianmiau.ml:3333/CPBL";
        let Data = {
            URL: `http://www.cpbl.com.tw/games/play_by_play.html?&game_type=${cpbldata["game_type"]}&game_id=${cpbldata["game_id"]}&game_date=${cpbldata["game_date"]}&pbyear=${cpbldata["pbyear"]}`
        };
        let Response = await this.GetData(url, Data);
        Response = [].concat.apply([], JSON.parse(Response));
        let IsRUN = true;
        if (Response[Response.length - 1]["title"].indexOf("比賽結束") !== -1 || Response[Response.length - 1]["title"].indexOf("final") !== -1) {
            IsRUN = false;
        }
        for (let i = 0; i < LineID.length; i++) {
            let Query = `SELECT * FROM \`line-cost-status\` WHERE \`userId\` = '${LineID[i]}' LIMIT 1;`;
            let res_Query = await this.app.Tools_MYSQLDB.Query(Query);
            let Data = res_Query;
            let Status = Data[0]['Status'];
            if (Status === "CPBL RUN") {
                let Extra = JSON.parse(Data[0]["Extra"]);
                let cpbldata = Extra["cpbldata"];
                let count = Extra["count"];
                if (Response.length > count) {
                    let replyMsg = "";
                    for (let j = count; j < Response.length; j++) {
                        replyMsg += Response[j]["title"];
                        if (j !== Response.length - 1) {
                            replyMsg += "\n\n";
                        }
                    }
                    if (IsRUN) {
                        let Extra = {
                            cpbldata: cpbldata,
                            count: Response.length
                        }
                        let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        let Query = `UPDATE \`line-cost-status\` SET \`datetime\`='${datetime}', \`Status\`='CPBL RUN', \`Extra\`='${JSON.stringify(Extra)}' WHERE (\`userid\`='${LineID[i]}');`;
                        let res_Query = await this.app.Tools_MYSQLDB.Query(Query);
                    } else {
                        let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                        let Query = `UPDATE \`line-cost-status\` SET \`datetime\`='${datetime}', \`Status\`='', \`Extra\`='' WHERE (\`userid\`='${LineID[i]}');`;
                        let res_Query = await this.app.Tools_MYSQLDB.Query(Query);
                        replyMsg += "\n\n已停止中職轉播功能";
                    }
                    let res_Msg = this.app.bot.push(LineID[i], replyMsg);
                }
            }
        }
        if (!IsRUN) {
            this.DelTime(game_id);
        }
    }

    async GetCPBLList(Date) {
        // let game_id = Time["game_id"];
        // let cpbldata = Time["cpbldata"];
        // let LineID = Time["LineID"];
        let url = "https://jianmiau.ml:3333/CPBLList";
        let Data = {
            Date: Date
        };
        let Response = await this.GetData(url, Data);
        Response = [].concat.apply([], JSON.parse(Response));
        let columns = [];
        for (let i = 0; i < Response.length; i++) {
            let img = [];
            let team = [];
            let data = "";
            let href = Response[i]["href"];
            for (let j = 1; j <= 2; j++) {
                if (Response[i][`img${j}`].indexOf("AJL011_logo_01") !== -1) {
                    img.push("https://jianmiau.ml/MyWeb/Resources/CPBL/R.png");
                    team.push("樂天桃猿");
                } else if (Response[i][`img${j}`].indexOf("B04_logo_01") !== -1) {
                    img.push("https://jianmiau.ml/MyWeb/Resources/CPBL/F.png");
                    team.push("富邦悍將");
                } else if (Response[i][`img${j}`].indexOf("D01_logo_01") !== -1) {
                    img.push("https://jianmiau.ml/MyWeb/Resources/CPBL/D.png");
                    team.push("味全龍");
                } else if (Response[i][`img${j}`].indexOf("E02_logo_01") !== -1) {
                    img.push("https://jianmiau.ml/MyWeb/Resources/CPBL/B.png");
                    team.push("中信兄弟");
                } else if (Response[i][`img${j}`].indexOf("L01_logo_01") !== -1) {
                    img.push("https://jianmiau.ml/MyWeb/Resources/CPBL/L.png");
                    team.push("統一獅");
                }
            }
            if (href["time"]) {
                data = `action=nogame&game_type=${href["game_type"]}&game_id=${href["game_id"]}&game_date=${href["game_date"]}&pbyear=${href["game_date"].substr(0, 4)}&time=${href["time"]}`;
            } else {
                data = `action=hasgame&game_type=${href["game_type"]}&game_id=${href["game_id"]}&game_date=${href["game_date"]}&pbyear=${href["game_date"].substr(0, 4)}`;
            }
            let url = `http://www.cpbl.com.tw/games/play_by_play.html?&game_type=${href["game_type"]}&game_id=${href["game_id"]}&game_date=${href["game_date"]}&pbyear=${href["game_date"].substr(0, 4)}`;
            let Data_columns = {
                "thumbnailImageUrl": img[0],
                "imageBackgroundColor": "#FFFFFF",
                "title": `${team[0]} VS ${team[1]}`,
                "text": `比賽場地 ${Response[i]["address"]} ${href["game_date"]}`,
                "defaultAction": {
                    "type": "uri",
                    "label": "比賽網站",
                    "uri": url
                },
                "actions": [
                    {
                        "type": "postback",
                        "label": "追蹤比賽",
                        "data": data
                    }
                ]
            };
            columns.push(Data_columns);
        }

        // columns = [
        //     {
        //         "thumbnailImageUrl": "https://jianmiau.ml/MyWeb/Resources/CPBL/L.png",
        //         "imageBackgroundColor": "#FFFFFF",
        //         "title": "this is menu",
        //         "text": "description",
        //         "defaultAction": {
        //             "type": "uri",
        //             "label": "View detail",
        //             "uri": "http://example.com/page/123"
        //         },
        //         "actions": [
        //             {
        //                 "type": "postback",
        //                 "label": "Buy",
        //                 "data": "action=buy&itemid=111"
        //             }
        //         ]
        //     },
        //     {
        //         "thumbnailImageUrl": "https://jianmiau.ml/MyWeb/Resources/CPBL/B.png",
        //         "imageBackgroundColor": "#000000",
        //         "title": "this is menu",
        //         "text": "description",
        //         "defaultAction": {
        //             "type": "uri",
        //             "label": "View detail",
        //             "uri": "http://example.com/page/222"
        //         },
        //         "actions": [
        //             {
        //                 "type": "postback",
        //                 "label": "Buy",
        //                 "data": "action=buy&itemid=222"
        //             }
        //         ]
        //     }
        // ]

        return new Promise((resolve, reject) => {
            // 傳入 resolve 與 reject，表示資料成功與失敗
            resolve(columns);
            // reject()
        });
    }

    /**
     * 取得表
     * @param Url Url
     * @param arrange 是否需要整理
     */
    GetData(Url, Data) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        var response = xhr.responseText;
                        resolve(response);
                    } else {
                        reject("");
                    }
                }
            };
            xhr.open("POST", Url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(Data));
        });
    }
}

module.exports = CPBLClass