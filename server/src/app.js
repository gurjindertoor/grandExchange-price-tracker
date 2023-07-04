import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import retrievePricesRouter, { retrieveData } from "./api/services/retrievePriceData.js";

import middleware from "./api/middlewares/middleware.js";
import faqsRouter from "./api/routes/faqs.js";
import indexRouter from "./api/routes/index.js";
import itemRouter from "./api/routes/item.js";
import itemsRouter from "./api/routes/items.js";
import searchRouter from "./api/routes/search.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

middleware(app);

app.use(express.json());
app.use(cors());

// Use MongoDB URI from .env file
mongoose.connect(
  process.env.MONGODB_URI
);

app.use("/retrieve-prices", retrievePricesRouter);
app.use('/', indexRouter);
app.use('/faqs', faqsRouter);
app.use('/item/:id', itemRouter);
app.use('/items', itemsRouter);
app.use('/search', searchRouter);

app.listen(3001, () => console.log("SERVER STARTED"));

const INTERVAL_TIME_MILLIS = 1000 * 60 * 5; // Retrieve API data every 5 minutes

setInterval(retrieveData, INTERVAL_TIME_MILLIS);
