/* eslint-disable no-unused-vars */
const APIError = require('../utils/APIError');
const log = require('../utils/log')(module);


/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
  };

  if (process.env.NODE_ENV !== 'development') {
    delete response.stack;
  }

  log.error('error', { path: req.path, err });

  res
    .status(err.status)
    .json(response)
    .end();
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
const converter = (err, req, res, next) => {
  let convertedError = err;

  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }

  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
const notFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: 404,
  });

  return handler(err, req, res);
};

module.exports = { handler, converter, notFound };
