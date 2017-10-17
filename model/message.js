'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Message Model`);
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {type: String, required: true},
  senderID: {type: Schema.Types.ObjectId, required: true, ref: 'profile'},
  content: {type: String, required: true},
  dateSent: {type: Date, default: Date.now},
  seenBy: [{type: Schema.Types.ObjectId, ref: 'profile'}],
  convoHubID: {type: Schema.Types.ObjectId, ref: 'convoHub', required: true}
});

const Message = module.exports = mongoose.model('message', messageSchema);