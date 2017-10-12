'use strict';

const debug = require('debug')('chat: Basic Auth');
const createError = require('http-errors');
const User = require('../model/user.js');

module.export = function(req, res, next) {

  let Authorization = req.headers;
};
