'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Profile Model`);
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  userName: {type: String, required: true, unique: true},
  userID: {type: Schema.Types.ObjectId, required: true, unique: true},
  requests: [{type: Schema.Types.ObjectId, ref: 'request'}],
  contacts: [type: Schema.Stypes.ObjectId, ref: 'profile']
});

const Profile = module.exports = mongoose.model('profile', profileSchema);
