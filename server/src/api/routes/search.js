// ./routes/search.js

import express from "express";
import { PriceModel } from '../models/Prices.js'; // import your PriceModel
import itemPairs from "../helpers/itemPairs.js";

const router = express.Router();
let currTime = Date.now();
let oneWeekAgo = currTime - 60 * 60 * 24 * 1000 * 7;

router.get("/", async (req, res) => {
  let itemTimestamp = [],
    itemHighPrice = [],
    itemLowPrice = [],
    itemInfo = [];
  let item_name = "";
  let recentTime = "";
  let itemNumber;

  const itemNameQuery = req.query.itemName;
  const itemCorrected =
    itemNameQuery.charAt(0).toUpperCase() + itemNameQuery.slice(1);

  const itemEntries = Object.entries(itemPairs);
  for (const [key, value] of itemEntries) {
    if (itemCorrected === key) {
      itemNumber = value;
    }
  }

  try {
    const prices = await PriceModel.find({
      item_id: itemNumber,
      timestamp: { $gt: oneWeekAgo },
    });

    if (prices && prices.length) {
      for (const price of prices) {
        const date = new Date(price.timestamp);
        const [month, day, year] = [
          date.getMonth() + 1,
          date.getDate(),
          date.getFullYear(),
        ];
        const [hour, minutes, seconds] = [
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        ];
        const timeString =
          hour.toString().padStart(2, "0") +
          ":" +
          minutes.toString().padStart(2, "0") +
          ":" +
          seconds.toString().padStart(2, "0");
        const dateString = `${year}-${month}-${day} ${timeString}`;

        itemHighPrice.push(price.high_price);
        itemLowPrice.push(price.low_price);
        itemTimestamp.push(dateString);
      }

      const recentPrice = await PriceModel.findOne({ item_id: itemNumber }).sort({ timestamp: -1 });

      const milliseconds = recentPrice.timestamp;
      const dateObject = new Date(milliseconds);
      const humanDateFormat = dateObject.toLocaleString();
      itemInfo.push(recentPrice);
      item_name = recentPrice.item_name;
      recentTime = humanDateFormat;
      res.render("search", {
        labels: itemTimestamp,
        dataHighPrice: itemHighPrice,
        dataLowPrice: itemLowPrice,
        itemID: item_name,
        recentTime: recentTime,
        dataInfo: itemInfo,
      });
    } else {
      res.render("error");
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;
