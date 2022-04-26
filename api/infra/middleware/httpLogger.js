const httpLogger = (req, res, next) => {
  console.info('req.params', req.params);
  console.info('req.query', req.query);
  console.info('req.headers', req.headers);

  next();
}

module.exports = { httpLogger };
