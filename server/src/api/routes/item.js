// ./routes/item.js

import express from "express";
import itemPairs from "../helpers/itemPairs.js";
import { PriceModel } from '../models/Prices.js'; // Import the price model
const router = express.Router();
let currTime = Date.now();
let oneWeekAgo = currTime - (60 * 60 * 24 * 1000 * 7);
let lastDay = currTime - (60 * 60 * 24 * 1000);

router.get('/:id', async (req, res) => {
    // Place the logic for '/item/:id' route here.
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

    const grabInfo = await PriceModel.find({
        item_id: itemNumber,
        timestamp: { $gt: oneWeekAgo }
    }).sort('timestamp');

    const priceChange = await PriceModel.find({
        item_id: itemNumber,
        timestamp: { $gt: lastDay }
    });

    const grabRecent = await PriceModel.findOne({ item_id: itemNumber }).sort('-timestamp');

    for (const item of grabInfo) {
        const date = new Date(item.timestamp);
        const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
        const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];
        const timeString = hour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day} ${timeString}`;
        itemHighPrice.push(item.high_price);
        itemLowPrice.push(item.low_price);
        itemTimestamp.push(dateString);
    }

    for (const item of priceChange) {
        lastDayHighPrices.push(item.high_price);
        lastDayLowPrices.push(item.low_price);
    }

    for (let i = 0; i < lastDayHighPrices.length; i++) {
        tempHigh += lastDayHighPrices[i];
        tempLow += lastDayLowPrices[i];
    }

    highAverage = Math.floor(tempHigh / lastDayHighPrices.length);
    lowAverage = Math.floor(tempLow / lastDayLowPrices.length);

    const milliseconds = grabRecent.timestamp;
    const dateObject = new Date(milliseconds);
    const humanDateFormat = dateObject.toLocaleString();
    itemInfo.push(grabRecent);
    item_name = grabRecent.item_name;
    recentTime = humanDateFormat;

    res.render('search', { labels: itemTimestamp, dataHighPrice: itemHighPrice, dataLowPrice: itemLowPrice, itemID: item_name, recentTime: recentTime, dataInfo: itemInfo, highAvg: highAverage, lowAvg: lowAverage });
});

export default router;