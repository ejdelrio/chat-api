'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')(`${process.env.APP_NAME}: Convo Router`);

const ConvoNode = require('../model/convo-node.js');
const ConvoHub = require('../model/convo-hub.js');
const Message = require('../model/message.js');
const Profile = require('../model/profile.js');

const bearerAuth = require('../lib/bearer.js');
const profileFetch = require('../lib/profile-fetch.js');

module.exports = socketio => {

  const convoRouter = new Router();

  convoRouter.post('/api/new-conversation',jsonParser, bearerAuth, function(req, res, next) {
    debug('POST /conversation/api');



    let newMessage = new Message(req.body);

    let newHub = new ConvoHub({

      messages: [newMessage._id]
    });

    newMessage.convoHubID = newHub._id;

    let nodeArray = req.body.members.map(val => {

      let unread = val.userName === req.user.userName ? 0 : 1;

      return new ConvoNode({
        profileID: val._id,
        messages: [newMessage._id],
        convoHubID: newHub._id,
        members: req.body.members.map(val => val._id),
        unread
      })
    });
    newHub.nodes = nodeArray.map(node => node._id);

    
    

    Promise.all([
      newMessage.save(),
      newHub.save(),
      Promise.all(nodeArray.map(node => node.save())),

      ...nodeArray.map(savedNode =>
        Profile.findByIdAndUpdate(
          savedNode.profileID,
          {$push: {'convos': savedNode._id}},
          {new: true}
        )
      ),
    ])

    .then(results => {
      return Promise.all(results[2].map(node => ConvoNode.populate(node, {path: 'messages'})));
    })

    .then(nodeArray => {
      nodeArray.forEach(node => {
        socketio.sockets.emit(`${node.profileID}-newNode`, node);
      });
      res.json({});
    })

    .catch(err => next(createError(400, err)));
  });


  convoRouter.post('/api/new-message/', jsonParser, bearerAuth, function(req, res, next) {
    debug('POST /api/new-message');

    let newMessage = new Message(req.body);
    var userProfile;

    Profile.findOne({userName: req.user.userName})
    .then(profile => userProfile = profile)

    .then(() => newMessage.save())
    .then(() => {
      return ConvoHub.findById(newMessage.convoHubID)
      .populate('nodes');
    })

    .then(hub => {
      let {nodes} = hub;
      return hub.updateChildren(userProfile, nodes, newMessage);
    })

    .then(updatedNodes => {
      updatedNodes.forEach(node => {
        socketio.sockets.emit(`${node._id}-nodeUpdate`, node);
      });
      socketio.sockets.emit(`${newMessage.convoHubID}-hubUpdate`);
      res.json({});
    })
    .catch(err => next(createError(400, err)));
  });


  convoRouter.put('/api/read-convo/:id', bearerAuth, function(req, res, next) {
    debug('PUT /api/read-convo');

    ConvoNode.findByIdAndUpdate(req.params.id, {unread: 0}, {new: true})
    .populate('messages')
    .populate('members')
    .then(node => {
      res.json(node);
    })
    .catch(err => next(createError(400, err)));

  });


  return convoRouter;
};
