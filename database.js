const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');

// Defining URLs for fetching item information and prices
const ITEM_INFO_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";
const ITEM_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs/latest";
const INTERVAL_TIME_MILLIS = 1000 * 60 * 5;

// Creating a new SQLite database connection
const db = new sqlite3.Database('database/ge.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.log(err);
    db.run('PRAGMA journal_mode = WAL;');
    console.log(`Database connection successful`);
})

// SQL command to insert data into the "grandExchange" table
const sql = `INSERT INTO "grandExchange"(timestamp, item_id, item_name, high_price, low_price)
                VALUES(?,?,?,?,?)`;

let itemInfo = [], itemPrices = [], results = [];

// Function to fetch data from the URLs and process it
function retrieveData() {
    axios.all([axios.get(ITEM_INFO_URL), axios.get(ITEM_PRICES_URL)])
        .then(axios.spread((itemInfoResponse, itemPriceResponse) => {
            itemInfo = itemInfoResponse.data.map(item => {
                return {
                    name: item.name,
                    id: item.id,
                }
            });

            const { data } = itemPriceResponse;
            itemPrices = Object.entries(data.data).map(([itemID, value]) => {
                return {
                    id: parseInt(itemID),
                    highPrice: value.high,
                    lowPrice: value.low,
                }
            });
        
            // Joining item information and prices based on item id
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
            });

            let epochTime = Date.now()

            for (const item of results) {
                db.run(sql, [epochTime, item.id, item.name, item.highPrice, item.lowPrice], (err) => {
                    if (err) console.log(err);
                })
            }
            console.log(`Completed at: ${new Date(epochTime)}`);

            itemInfo = [], itemPrices = [], results = [];

        }))
        .catch((err) => {
            if (err) console.log(err);
        })
};

// Updating Data from a JSON file
try {
    const data = fs.readFileSync('./update_delete/updateData.JSON', 'utf8');
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

// Deleting Data from a JSON file
try {
    const data = fs.readFileSync('./update_delete/deleteData.JSON', 'utf8');
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

const insertDataToDB = setInterval(retrieveData, INTERVAL_TIME_MILLIS);
