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

  requestRouter.post('/api/friendrequest', jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('POST /api/friendrequest');
    let {userName, _id} = req.body;
    let {profile} = req;

    let friendRequest = new Request({
      from: profile.userName,
      to: userName,
      fromID: profile._id,
      toID: _id
    });

    profile.requests.push(friendRequest._id);
    Profile.findByIdAndUpdate(
      _id,
      {$push: {'requests': friendRequest._id}},
      {new: true}
    )
    .then(() => profile.save())
    .then(() => friendRequest.save())
    .then(() => {
      socketio.sockets.emit(`${userName}-newRequest`, friendRequest);
      res.send(friendRequest);
    })
    .catch(err => next(createError(400, err)));
  });

  requestRouter.put('/api/friendRequest/reject/:id', jsonParser, bearerAuth, function(req, res, next) {
    debug('PUT /api/friendRequest/reject');

    Request.findByIdAndUpdate(req.params.id, {status: 'rejected'}, {new: true})
    .then(request => {
      socketio.sockets.emit(`${request._id}-rejectRequest`, request);
      res.send(request);
    })
    .catch(err => next(createError(400, err)));
  });

  requestRouter.put('/api/friendRequest/accept/:id', jsonParser, bearerAuth, function(req, res, next) {
    debug('PUT /api/friendRequest/accept');
    
  });



  return requestRouter;
};
