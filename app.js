const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const itemPairs = require('./item_info/itemID.js');

let currTime = Date.now();
let oneWeekAgo = currTime - (60 * 60 * 24 * 1000 * 7);
let lastDay = currTime - (60 * 60 * 24 * 1000);

const app = express();

const PORT = 3000;

const db = new sqlite3.Database('./database/ge.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) console.log(err);
    console.log("Database connection: successful");
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/search', (req, res) => {
    let itemTimestamp = [], itemHighPrice = [], itemLowPrice = [], itemInfo = [];

    let item_name = '';
    let recentTime = '';

    let itemNumber;

    const itemNameQuery = req.query.itemName;
    const itemCorrected = itemNameQuery.charAt(0).toUpperCase() + itemNameQuery.slice(1);

    const itemEntries = Object.entries(itemPairs);
    for (const [key, value] of itemEntries) {
        if (itemCorrected === key) {
            itemNumber = value;
        }
    }

    let sqlGrabInfo = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} AND timestamp > ${oneWeekAgo}`;

    let sqlPriceChange = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} AND timestamp > ${lastDay}`;

    let sqlGrabRecent = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} ORDER BY timestamp DESC LIMIT 1`;

    db.all(sqlGrabInfo, [], (err, row) => {
        if (err) console.log(err);
        if (row !== undefined) {
            for (const rowItem of row) {
                const date = new Date(rowItem.timestamp);

                const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];

                const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];

                const timeString = hour.toString().padStart(2, '0')
                    + ':' + minutes.toString().padStart(2, '0')
                    + ':' + seconds.toString().padStart(2, '0');

                const dateString = `${year}-${month}-${day} ${timeString}`

                itemHighPrice.push(rowItem.high_price);
                itemLowPrice.push(rowItem.low_price);
                itemTimestamp.push(dateString);
            }


            db.get(sqlGrabRecent, [], (err, row) => {
                if (err) console.log(err);
                const milliseconds = row.timestamp;
                const dateObject = new Date(milliseconds);
                const humanDateFormat = dateObject.toLocaleString();

                itemInfo.push(row);
                item_name = row.item_name;
                recentTime = humanDateFormat;

                res.render('search', { labels: itemTimestamp, dataHighPrice: itemHighPrice, dataLowPrice: itemLowPrice, itemID: item_name, recentTime: recentTime, dataInfo: itemInfo })
            })
        } else {
            res.render('error');
        }
    })
});

const resultsPerPage = 50;
app.get('/items', (req, res) => {
    let sql_lookup = `SELECT DISTINCT item_name, item_id, high_price, low_price FROM grandExchange`;
    db.all(sql_lookup, [], (err, row) => {
        if (err) console.log(err);
        const numOfResults = row.length;
        const numOfPages = Math.ceil(numOfResults / resultsPerPage);
        let page = req.query.page ? Number(req.query.page) : 1;
        if (page > numOfPages) {
            return res.redirect('?page=' + encodeURIComponent(numOfPages.toString()));
        } else if (page < 1) {
            return res.redirect('?page=' + encodeURIComponent('1'));
        }

        const startLimit = (page - 1) * resultsPerPage;
        sql_lookup = `SELECT DISTINCT item_name, item_id, high_price, low_price FROM grandExchange LIMIT ${startLimit}, ${resultsPerPage}`;
        db.all(sql_lookup, [], (err, row) => {
            if (err) console.log(err);
            let iterator = (page - 5) < 1 ? 1 : page - 5;
            let endLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages - page);
            if (endLink < (page + 4)) {
                iterator -= (page + 4) - numOfPages;
            }
            res.render('items', { data: row, page, iterator, endLink, numOfPages });
        })
    })
})

app.get('/item/:id', (req, res) => {
    let itemTimestamp = [], itemHighPrice = [], itemLowPrice = [], itemInfo = [], lastDayHighPrices = [], lastDayLowPrices = [];

    let item_name = '';
    let recentTime = '';

    let itemNumber, highAverage, lowAverage;
    let tempHigh = 0, tempLow = 0;

    const itemID = req.params.id;
    const itemCorrected = itemID.charAt(0).toUpperCase() + itemID.slice(1);

    const itemEntries = Object.entries(itemPairs);
    for (const [key, value] of itemEntries) {
        if (itemCorrected === key) {
            itemNumber = value;
        }
    }

    let sqlGrabInfo = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} AND timestamp > ${oneWeekAgo} ORDER BY timestamp ASC`

    let sqlPriceChange = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} AND timestamp > ${lastDay}`;

    let sqlGrabRecent = `SELECT timestamp, item_id, item_name, high_price, low_price FROM grandExchange WHERE item_ID = ${itemNumber} ORDER BY timestamp DESC LIMIT 1`


    db.all(sqlGrabInfo, [], (err, row) => {
        if (err) console.log(err);
        for (const rowItem of row) {
            const date = new Date(rowItem.timestamp);

            const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];

            const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];

            const timeString = hour.toString().padStart(2, '0')
                + ':' + minutes.toString().padStart(2, '0')
                + ':' + seconds.toString().padStart(2, '0');

            const dateString = `${year}-${month}-${day} ${timeString}`

            itemHighPrice.push(rowItem.high_price);
            itemLowPrice.push(rowItem.low_price);
            itemTimestamp.push(dateString);
        }

        db.all(sqlPriceChange, [], (err, row) => {
            for (const rowItem of row) {
                lastDayHighPrices.push(rowItem.high_price);
                lastDayLowPrices.push(rowItem.low_price)
            }

            for (let i = 0; i < lastDayHighPrices.length; i++) {
                tempHigh += lastDayHighPrices[i];
                tempLow += lastDayLowPrices[i];

            }

            highAverage = Math.floor(tempHigh / lastDayHighPrices.length);
            lowAverage = Math.floor(tempLow / lastDayLowPrices.length);
        })

        db.get(sqlGrabRecent, [], (err, row) => {
            if (err) console.log(err);
            const milliseconds = row.timestamp;
            const dateObject = new Date(milliseconds);
            const humanDateFormat = dateObject.toLocaleString();
            itemInfo.push(row);
            item_name = row.item_name;
            recentTime = humanDateFormat;

            res.render('search', { labels: itemTimestamp, dataHighPrice: itemHighPrice, dataLowPrice: itemLowPrice, itemID: item_name, recentTime: recentTime, dataInfo: itemInfo, highAvg: highAverage, lowAvg: lowAverage })
        })
    })
})

app.get('/faqs', (req, res) => {
    res.render('faqs');
})

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Successfully connected at port ${PORT}`);
})
