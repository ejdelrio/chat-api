'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Convo Node Schema`);
const Schema = mongoose.Schema;

const convoNodeSchema = new Schema(({
  profileID: {type: Schema.Types.ObjectId, ref: 'profile', required: true},
  messages: [{type: Schema.Types.ObjectId, ref: 'message'}],
  convoHubID: {type: Schema.Types.ObjectId, ref: 'convoHub', required: true},
  unread: {type: Number, default: 0}
}));

const convoNode = module.exports = mongoose.model('convoNode', convoNodeSchema);