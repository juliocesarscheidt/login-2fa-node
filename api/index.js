const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const twofactor = require('node-2fa');

const { encryptPassword, comparePasswordSync, generateToken, decodeJwtToken } = require('./encryption');
const e = require('express');

const router = express.Router();
const app = express();

const port = process.env.API_PORT || 5050;
const host = process.env.API_HOST || '0.0.0.0';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', router);

const getConnectionPool = async () => {
  // MySQL pool
  const mysqlPool = mysql.createPool({
    connectionLimit: 1,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE,
  });
  return mysqlPool.promise();
}

const APP_NAME = 'Blackdevs API';

router.post('/auth/signin', async (req, res) => {
  console.info('req.params', req.params);
  console.info('req.query', req.query);
  console.info('req.headers', req.headers);

  const { email, password, token } = req.body;

  try {
    const pool = await getConnectionPool();
    const [[result]] = await pool
      .query(`SELECT id, username, password, 2fa_secret AS secret FROM users WHERE email = ? LIMIT 1`, [email]);
    console.info('[INFO] result', result);

    if (!result) {
      return res.status(401).json({ status: 'Unauthorized', message: 'Invalid username or password' });
    }

    if (!comparePasswordSync(password, result.password)) {
      return res.status(401).json({ status: 'Unauthorized', message: 'Invalid username or password' });
    }

    if (!result?.secret) {
      const secretObject = twofactor.generateSecret({ name: APP_NAME, account: email });
      console.info('[INFO] secretObject', secretObject);

      // save secret on database
      await pool
        .query(`UPDATE users SET 2fa_secret = ? WHERE id = ?`, [secretObject.secret, result.id]);

      return res
        .status(200)
        .json({status: 'Success', qr_code: secretObject.qr });
    }

    if (!token) {
      return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
    }

    const verifyToken = twofactor.verifyToken(result.secret, token);
    console.info('[INFO] verifyToken', verifyToken)
    if (verifyToken?.delta !== 0) {
      return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
    }

    const userBody = {
      id: result.id,
      username: result.username,
      email,
    };
    console.info('[INFO] userBody', userBody)
    const accessToken = generateToken(userBody);

    return res.status(200).json({ status: 'Success', access_token: accessToken });

  } catch (err) {
    console.error('[ERROR] err', err);
    const message = err?.sqlMessage || err?.message;
    return res.status(500).json({ status: 'Internal Server Error', message });
  }
});

router.post('/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const passwordEndrypted = encryptPassword(password);

  try {
    const pool = await getConnectionPool();
    const [result] = await pool
      .query(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, passwordEndrypted]);
    console.info('[INFO] result', result);

    const user = {
      id: result.insertId,
      username,
      email,
    };
    console.info('[INFO] user', user)
    const accessToken = generateToken(user);

    return res.status(201).json({ status: 'Created', access_token: accessToken });

  } catch (err) {
    console.error('[ERROR] err', err);
    const message = err?.sqlMessage || err?.message;
    return res.status(500).json({ status: 'Internal Server Error', message });
  }
});

router.get('/user/me', async (req, res) => {
  const auth = req?.headers?.authorization;
  const token = auth && auth.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
  }

  const tokenDecoded = decodeJwtToken(token);
  if (!tokenDecoded) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
  }
  const user = {
    id: tokenDecoded.id,
    username: tokenDecoded.username,
    email: tokenDecoded.email,
  };
  return res.status(200).json({ status: 'Ok', user });
});

router.put('/user/me/2fa/reset', async (req, res) => {
  const auth = req?.headers?.authorization;
  const token = auth && auth.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
  }

  const tokenDecoded = decodeJwtToken(token);
  if (!tokenDecoded) {
    return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
  }

  const userId = tokenDecoded.id;

  try {
    const pool = await getConnectionPool();
    await pool
      .query(`UPDATE users SET 2fa_secret = NULL WHERE id = ?`, [userId]);

    return res.status(202).json({ status: 'Accepted' });

  } catch (err) {
    console.error('[ERROR] err', err);
    const message = err?.sqlMessage || err?.message;
    return res.status(500).json({ status: 'Internal Server Error', message });
  }
});

app.listen(port, host, () => {
  console.info(`Server listening on ${host}:${port}`);
});
