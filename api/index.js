const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const app = express();

const port = process.env.API_PORT || 5050;
const host = process.env.API_HOST || '0.0.0.0';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', router);

require('./infra/controller/authController')(router);
require('./infra/controller/userController')(router);

app.listen(port, host, () => {
  console.info(`Server listening on ${host}:${port}`);
});
