import express from "express";
import { PriceModel } from '../models/Prices.js';
const router = express.Router();
const resultsPerPage = 50;

router.get('/', async (req, res) => {
  try {
    // Fetch distinct item IDs
    const distinctItems = await PriceModel.distinct('item_id');

    // Pagination
    const numOfResults = distinctItems.length;
    const numOfPages = Math.ceil(numOfResults / resultsPerPage);
    let page = req.query.page ? parseInt(req.query.page) : 1;

    if (page > numOfPages) {
      return res.redirect('/items?page=' + numOfPages);
    } else if (page < 1) {
      return res.redirect('/items?page=1');
    }

    const startLimit = (page - 1) * resultsPerPage;

    // Fetch item details using distinct item IDs and sort by item name
    const itemsInfo = await PriceModel.aggregate([
      { $match: { item_id: { $in: distinctItems } } },
      { $group: { _id: '$item_id', item_name: { $first: '$item_name' }, high_price: { $max: '$high_price' }, low_price: { $min: '$low_price' } } },
      { $sort: { item_name: 1 } }, // Sort by item name in ascending order
      { $skip: startLimit },
      { $limit: resultsPerPage }
    ]);

    let iterator = (page - 5) < 1 ? 1 : page - 5;
    let endLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages - page);
    if (endLink < (page + 4)) {
      iterator -= (page + 4) - numOfPages;
    }

    res.render('items', { data: itemsInfo, page, iterator, endLink, numOfPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

export default router;
