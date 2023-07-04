import express from "express";
import axios from "axios";
import { PriceModel } from "../models/Prices.js";

const router = express.Router();

const ITEM_INFO_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";
const ITEM_PRICES_URL = "https://prices.runescape.wiki/api/v1/osrs/latest";

export async function retrieveData() {
  try {
    console.log("Starting retrieval...");
    const [itemInfoResponse, itemPriceResponse] = await Promise.all([
      axios.get(ITEM_INFO_URL),
      axios.get(ITEM_PRICES_URL),
    ]);

    const itemInfo = itemInfoResponse.data.map((item) => ({
      name: item.name,
      id: item.id,
    }));

    const itemPrices = Object.entries(itemPriceResponse.data.data).map(
      ([itemID, value]) => ({
        id: parseInt(itemID),
        highPrice: value.high,
        lowPrice: value.low,
      })
    );

    const results = itemInfo.map((e) => {
      const temp = itemPrices.find((element) => element.id === e.id);
      if (temp !== undefined) {
        e.highPrice = temp.highPrice;
        e.lowPrice = temp.lowPrice;
      } else {
        e.highPrice = -1;
        e.lowPrice = -1;
      }
      return e;
    });

    const epochTime = Date.now();
    const promises = [];

    for (const item of results) {
      const newItem = new PriceModel({
        timestamp: epochTime,
        item_id: item.id,
        item_name: item.name,
        high_price: item.highPrice,
        low_price: item.lowPrice,
      });

      promises.push(newItem.save());
    }

    await Promise.all(promises);

    console.log(`Completed at: ${new Date(epochTime)}`);
  } catch (error) {
    console.log(error);
  }
}

router.get("/", async (req, res) => {
  try {
    await retrieveData();
    res.json({ message: "Data retrieval and saving completed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
});

export default router;
