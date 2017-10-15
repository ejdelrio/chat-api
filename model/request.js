'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Request Model`);
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  from: {type: String, required: true},
  to: {type: String, required: true},
  status: {type: String, required: true, default: 'pending'},
  dateSent: {type: Date, default: Date.now}
});

const Request = module.exports = mongoose.model('request', requestSchema);
