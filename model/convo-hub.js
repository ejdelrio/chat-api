'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Convo Hub Model`);
const Schema = mongoose.Schema;

const convoHubSchema = new Schema({
  messages: [{type: Schema.Types.ObjectId, ref: 'message'}],
  members: [{type: Schema.Types.ObjectId, ref: 'profile'}],
  nodes: [{type: Schema.Types. ObjectId, ref: 'convoNode'}]
});

const convoHub = module.exports = mongoose.model('convHub', convoHubSchema);

convoHub.prototype.updateChildren = function(profile, nodesArray, message) {
  return Promise.all(

    nodesArray.map(node => {

      node.messages.push(message._id);
      if(node.profileID !== profile._id) node.unread += 1;

      return node.save().populate('messages');
    })

  );
};