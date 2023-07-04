# Runescape Grand Exchange Database
https://www.rsgraph.com

## Description
This project is an application that uses JavaScript, Express.JS, Plotly, MongoDB, and API requests to interact with the Runescape Grand Exchange API. It fetches the latest item information and prices from the Runescape Grand Exchange API every 5 minutes, stores it into a MongoDB database, and provides visualization using Plotly.

## Features
* Fetches and updates data every five minutes from the Runescape Grand Exchange API.
* Stores data in MongoDB
* Updates and deletes records from a MongoDB database using JSON files.
* Visualizes data using Plotly.

## REST API Endpoints

The application provides several REST API endpoints:

- `GET /` - Serves the home page of the application.
- `GET /search` - Serves the search page, with details of a specific item.
- `GET /items` - Serves the items page, showing all available items in the database.
- `GET /item/:id` - Serves a specific item page, showing all details for an item.
- `GET /faqs` - Serves the FAQs page.

## License

This project is available under the [MIT License](https://github.com/gurjindertoor/grandExchange_price_tracker/blob/main/LICENSE).

## Images
![ge_1](https://github.com/gurjindertoor/grandExchange_price_tracker/assets/78512847/247a703a-231d-47ce-9bbd-7c772465b51d)

![ge_5](https://github.com/gurjindertoor/grandExchange_price_tracker/assets/78512847/98f63786-6202-407b-afcb-5b5382363a6a)

![ge_2](https://github.com/gurjindertoor/grandExchange_price_tracker/assets/78512847/1fcbff5b-7fd0-4d8a-bd7d-85e115f0b639)

![ge_3](https://github.com/gurjindertoor/grandExchange_price_tracker/assets/78512847/d2686965-88d2-40f6-a4b5-fb529e59e953)

![ge_4](https://github.com/gurjindertoor/grandExchange_price_tracker/assets/78512847/082371dc-ac36-4dfb-97c7-cd6ac68cecf2)
