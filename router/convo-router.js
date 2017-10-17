'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')(`${process.env.APP_NAME}: Convo Router`);

const ConvoNode = require('../model/convo-node.js');
const ConvoHub = require('../model/convo-hub.js');
const Message = require('../model/message.js');
const Profile = require('./model/profile.js');

const bearerAuth = require('../lib/bearer.js');
const profileFetch = require('../lib/profile-fetch.js');

module.exports = socketio => {

  const convoRouter = new Router();

  convoRouter.post('/api/new-conversation',jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('POST /conversation/api');

    let {members, message} = req.body;

    let newMessage = new Message(message);

    let newHub = new ConvoHub({
      members: members.map(val => val._id),
      messages: [newMessage._id]
    })

    newMessage.convoHubID = newHub._id;

    let nodeArray = members.map(val => {
      let unread = newMessage.sender === req.user.userName ? 0 : 1;
      return new ConvoNode({
        profileID: val._id,
        messages: [newMessage._id],
        convoHubID: newHub._id,
        unread
      })
    });
    
    

    Promise.all([
      newMessage.save(),
      newHub.save(),
      ...nodeArray.map(node => node.save().populate('messages')),
      ...nodeArray.map(node => Profile.findOneAndUpdate(node.profileID, {$push: {'convos': node._id}}))
    ])

    .then(results => {
      results[2].forEach(node => {
        socketio.sockets.emit(`${node.profileID}-newNode`, node);
      });
    })

    .catch(err => next(createError(400, err)));
  });


  convoRouter.post('/api/new-message/', jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('POST /api/new-message');

    let newMessage = new Message(req.body);

    newMessage.save()
    .then(() => {
      return ConvoHub.findByIdAndUpdate(
        newMessage.convoHubID,
        {$push: {'messages': newMessage._id}}
      )
      .populate('nodes');

    })

    .then(hub => {
      let {nodes} = hub;

      return Promise.all([

      ]);
    })



    .then(nodes => {
      nodes.forEach(node => {
        socketio.sockets.emit(`${node._id}-nodeUpdate`, node);
      });
    })
    .catch(err => next(createError(400, err)));
  });

  return convoRouter;
};
