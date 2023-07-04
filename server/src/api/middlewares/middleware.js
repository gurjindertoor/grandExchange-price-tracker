import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// Obtain the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const middleware = (app) => {
  // Setting up the View Engine as EJS and defining the views and public directories
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../../../client/src/views')); // Update the views path here
  app.use('/public', express.static(path.join(__dirname, '../../../../client/src/public'))); // Update the public path here
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
};

export default middleware;
