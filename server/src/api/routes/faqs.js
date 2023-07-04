// ./routes/faqs.js

import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    res.render('faqs');
})

export default router;
