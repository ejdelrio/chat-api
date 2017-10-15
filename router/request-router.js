'use strict';

const Router = require('express').Router;
const debug = require('debug')(`${process.env.APP_NAME}: Request Router`);
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const profileFetch = require('../lib/profile-fetch.js');
const bearerAuth = require('../lib/bearer.js');
const Request = require('../model/request.js');
const Profile = require('../model/profile.js');

module.exports = socketio => {
  let requestRouter = new Router();

  requestRouter.post('/api/friendrequest', jsonParser, bearerAuth, function(req, res, next) {
    debug('POST /api/friendrequest');
    let {userName} = req.body;

    let friendRequest = new Request({
      from: req.user.userName,
      to: userName,
    });

    Promise.all([
      Profile.findOneAndUpdate(
        {userName},
        {$push: {'requests.received.pending': friendRequest._id}},
        {new: true}
      ),
      Profile.findOneAndUpdate(
        {userName: req.user.userName},
        {$push: {'requests.sent.pending': friendRequest._id}},
        {new: true}
      ),
      friendRequest.save()
    ])

    .then(() => {
      socketio.sockets.emit(`${userName}-newRequest`, friendRequest);
      res.send(friendRequest);
    })

    .catch(err => next(createError(400, err)));
  });


  requestRouter.put('/api/friendRequest/reject/', jsonParser, bearerAuth, function(req, res, next) {
    debug('PUT /api/friendRequest/reject');
    let {from, to, _id} = req.body;

    Promise.all([
      Profile.findOneAndUpdate(
        {userName: from},
        {
          $push: {'requests.sent.rejected': _id},
          $pull: {'requests.sent.pending': {_id}}
        },
        {
          new: true,
          safe: true
        }
      ),
      Profile.findOneAndUpdate(
        {userName: to},
        {
          $push: {'requests.received.rejected': _id},
          $pull: {'requests.received.pending': {_id}}
        },
        {
          new: true,
          safe: true
        }
      )
    ])

    .then(() => {
      return Request.findByIdAndUpdate(_id, {status: 'rejected'}, {new: true});
    })

    .then(request => {
      socketio.sockets.emit(`${request._id}-updateRequest`, request);
      res.send(request);
    })

    .catch(err => next(createError(400, err)));
  });


  requestRouter.put('/api/friendRequest/accept/:id', jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('PUT /api/friendRequest/accept');

    var updatedRequest;

    Request.findByIdAndUpdate(req.params._id, {status: 'accepted'}, {new: true})
    .then(request => updatedRequest = request)
    .then(() => req.profile.contacts.push(updatedRequest.fromID))
    .then(() => req.profile.save())
    .then(() => Profile.findByIdAndUpdate(
      updatedRequest.fromID,
      {$push: {'contacts': updatedRequest.toID}},
      {new: true}
    ))

    .then(profile => {
      socketio.sockets.emit(`${updatedRequest.toID}-newContact`, profile);
      socketio.sockets.emit(`${updatedRequest.fromID}-newContact`, req.profile);
      socketio.sockets.emit(`${updatedRequest._id}-acceptRequest`, updatedRequest);
      res.json(updatedRequest);
    })
    .catch(err => next(createError(400, err)));
  });

  return requestRouter;
};
