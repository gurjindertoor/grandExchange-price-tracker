const axios = require('axios');

const ITEM_INFO_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";

const itemInfoRequest = axios.get(ITEM_INFO_URL);
let itemInfo = {};

axios.all([itemInfoRequest])
    .then(axios.spread((...responses) => {
        const itemInfoResponse = responses[0];

        for (const item of itemInfoResponse.data) {
            itemInfo[item.name] = item.id;
            // itemInfo.push({
            //     name: item.name,
            //     id: item.id,
            // })
        }
        // const { data } = itemPriceResponse;
        // const itemPricesInfo = Object.entries(data.data);

        // for (const [itemID, value] of itemPricesInfo) {
        //     itemPrices.push({
        //         id: parseInt(itemID),
        //         highPrice: value.high,
        //         lowPrice: value.low,
        //     })
        // }
    })).then(() => {
        console.log(itemInfo);
    })