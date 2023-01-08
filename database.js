const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');

const ITEM_INFO_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";
const ITEM_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs/latest";
const INTERVAL_TIME_MILLIS = 1000 * 60 * 5;

const itemInfoRequest = axios.get(ITEM_INFO_URL);
const itemPriceRequest = axios.get(ITEM_PRICES_URL);

const db = new sqlite3.Database('./ge.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.log(err);

    console.log('Database connection successful');
})

const sql = `INSERT INTO "grandExchange"(timestamp, item_id, item_name, high_price, low_price)
                VALUES(?,?,?,?,?)`;

let itemInfo = [], itemPrices = [], results = [];

function retrieveData() {
    axios.all([itemInfoRequest, itemPriceRequest])
        .then(axios.spread((...responses) => {
            const itemInfoResponse = responses[0];
            const itemPriceResponse = responses[1];

            for (const item of itemInfoResponse.data) {
                itemInfo.push({
                    name: item.name,
                    id: item.id,
                })
            }
            const { data } = itemPriceResponse;
            const itemPricesInfo = Object.entries(data.data);

            for (const [itemID, value] of itemPricesInfo) {
                itemPrices.push({
                    id: parseInt(itemID),
                    highPrice: value.high,
                    lowPrice: value.low,
                })
            }
        }))
        .then(() => {
            results = itemInfo.map((e, i) => {
                let temp = itemPrices.find(element => element.id === e.id);
                if (temp !== undefined) {
                    e.highPrice = temp.highPrice;
                    e.lowPrice = temp.lowPrice;
                } else {
                    e.highPrice = -1;
                    e.lowPrice = -1;
                }
                return e;
            })
        })
        .then(() => {
            let epochTime = Date.now();

            for (const item of results) {
                db.run(sql, [epochTime, item.id, item.name, item.highPrice, item.lowPrice], (err) => {
                    if (err) console.log(err);
                })
            }
            console.log(`${epochTime}: Completed`);

            itemInfo = [], itemPrices = [], results = [];

        })
        .catch((err) => {
            if (err) console.log(err);
        })
};

//updating Data
try {
    const data = fs.readFileSync('updateData.JSON', 'utf8');
    if (data) {
        let sqlUpdate = `UPDATE grandExchange SET timestamp = ? item_id  = ? item_name = ? high_price = ? low_price = ? WHERE timestamp = ? item_id = ? item_name = ? high_price = ? low_price = ?`

        db.run(sqlUpdate, data, (err) => {
            if (err) console.log(err);
            console.log(`Row(s) updated: ${this.changes}`)
        })
    }
} catch (err) {
    if (err) console.log(err);
}

//deleting Data
try {
    const data = fs.readFileSync('deleteData.JSON', 'utf8');
    if (data) {
        let sqlDelete = `UPDATE grandExchange SET timestamp = ? item_id  = ? item_name = ? high_price = ? low_price = ? WHERE timestamp = ? item_id = ? item_name = ? high_price = ? low_price = ?`

        db.run(sqlDelete, data, (err) => {
            if (err) console.log(err);
            console.log(`Row(s) updated: ${this.changes}`)
        })
    }
} catch (err) {
    if (err) console.log(err);
}


// module.exports = retrieveData;
const insertDataToDB = setInterval(retrieveData, INTERVAL_TIME_MILLIS);
