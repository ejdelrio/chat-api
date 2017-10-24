'use strict';

const mongoose = require('mongoose');
const debug = require('debug')(`${process.env.APP_NAME}: Convo Hub Model`);
const Schema = mongoose.Schema;
const ConvoNode = require('./convo-node.js');

const convoHubSchema = new Schema({
  nodes: [{type: Schema.Types. ObjectId, ref: 'convoNode'}]
});

const convoHub = module.exports = mongoose.model('convHub', convoHubSchema);


convoHub.prototype.updateChildren = function(profile, nodesArray, message) {
  debug('updateChildren CONVOHUB method');
  return Promise.all(

    nodesArray.map(node => {
      node.messages.push(message._id);

      if(node.profileID.toString() !== profile._id.toString()) node.unread += 1;
      return node.save();
    })
  )
  .then(nodes => {
    return Promise.all(
      nodes.map(node => {
        return ConvoNode.populate(node, [{path: 'messages'}, {path: 'members'}]);
      })
    );
  })
};