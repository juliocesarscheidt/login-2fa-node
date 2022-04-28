const express = require('express');
const bodyParser = require('body-parser');

const httpRouter = express.Router();
const app = express();
const DatabaseConnection = require('./infra/adapter/databaseConnection');
const Router = require('./shared/infra/router');

const port = process.env.API_PORT || 5050;
const host = process.env.API_HOST || '0.0.0.0';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', httpRouter);
new Router(httpRouter, new DatabaseConnection())

app.listen(port, host, () => {
  console.info(`Server listening on ${host}:${port}`);
});
