FROM node:latest

WORKDIR /app

COPY . /app/

RUN npm i 

CMD [ "node", "/app/app.js" ]