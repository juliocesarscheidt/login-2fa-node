const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

const comparePasswordSync = (passwordSource, passwordTarget) => {
  return bcrypt.compareSync(passwordSource, passwordTarget);
}

const encodeJwtToken = (payload) => {
  return jwt.sign(payload, process.env.APP_JWT_SECRET);
}

const decodeJwtToken = (token) => {
  try {
    const tokenDecoded = jwt.decode(token, process.env.APP_JWT_SECRET);
    if (new Date(tokenDecoded.exp * 1000) <= new Date()) {
      console.error('Token expired');
      return null;
    }
    return tokenDecoded;

  } catch (exception) {
    console.error('Exception', exception);
    return null;
  }
}

const generateToken = (payloadBody) => {
  const now = Math.floor(Date.now() / 1000);
  const exp = 60 * 60 * 1; // 1 hour
  const payload = {
    ...payloadBody,
    iat: now,
    exp: now + exp
  };
  return encodeJwtToken(payload);
};

module.exports = {
  encryptPassword,
  comparePasswordSync,
  encodeJwtToken,
  decodeJwtToken,
  generateToken,
}
