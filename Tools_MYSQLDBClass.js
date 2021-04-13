const mysql = require('mysql');

/** Tools_MYSQLDB */
class Tools_MYSQLDBClass {
    constructor() {
        let config = {
            host: 'jianmiau.tk',
            user: 'jianmiau',
            password: 'VQ*ZetC7xcc9%dTW',
            database: 'line-cost-php',
            port: 3307
        };
        this.conn = new mysql.createConnection(config);
        this.conn.connect(
            function (err) {
                if (err) {
                    console.log("!!! Cannot connect !!! Error:");
                    throw err;
                }
                else {
                    console.log("jianmiau.tk Connect.");
                }
            });
    }

    Query(Query) {
        return new Promise((resolve, reject) => {
            this.conn.query(Query,
                function (err, results, fields) {
                    if (err) {
                        reject(err);
                    }
                    resolve(results);
                });
        })
    }

    CloseDB() {
        this.conn.end(
            function (err) {
                if (err) throw err;
                else console.log('Closing connection.')
            });
    }

    // readData() {
    //     this.conn.query('SELECT * FROM `LoveZhuHan` LIMIT 2',
    //         function (err, results, fields) {
    //             if (err) throw err;
    //             else console.log('Selected ' + results.length + ' row(s).');
    //             for (let i = 0; i < results.length; i++) {
    //                 console.log('Row: ' + JSON.stringify(results[i]));
    //             }
    //             console.log('Done.');
    //         });
    //     // this.conn.end(
    //     //     function (err) {
    //     //         if (err) throw err;
    //     //         else console.log('Closing connection.')
    //     //     });
    // }
}

module.exports = Tools_MYSQLDBClass