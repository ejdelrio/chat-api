'use strict';

const debug = require('debug')('giggle: Error Middleware');
const createError = require('http-errors');

module.exports = function(err, req, res, next) {
  debug('Error');

  console.error('message:', err.message);
  console.error('name:', err.name);

  if(err.status) {
    console.log(err.message)
    res.status(err.status).send(err.message);
    next();
    return;
  }

  if (Object.keys(req.body).length === 0 || err.name === 'ValidationError') {
    err = createError(400, err.message);
    res.status(err.status).send(err.message);
    next();
    return;
  }

  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};
