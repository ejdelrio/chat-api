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

    let friendRequest = new Request({
      from: req.user.userName,
      to: userName,
      toID: _id,
      fromID: req.profile._id
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
          $pull: {'requests.sent.pending': _id}
        },
        {
          new: true,
          protected: true
        }
      ),
      Profile.findOneAndUpdate(
        {userName: to},
        {
          $push: {'requests.received.rejected': _id},
          $pull: {'requests.received.pending': _id}
        },
        {
          new: true,
          protected: true
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


  requestRouter.put('/api/friendrequest/accept/', jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('PUT /api/friendRequest/accept');

    let {from, to, fromID, toID, _id} = req.body;
    let updatedRequest, myProfile;

    Request.findByIdAndUpdate(req.body._id, {status: 'accepted'}, {new: true})
    .then(request => updatedRequest = request)
    .then(() =>
      Profile.findOneAndUpdate(
        {userName: from},
        {
          $push: {
            'requests.sent.accepted': _id,
            'contacts': toID
          },
          $pull: {'requests.sent.pending': _id}
        },
        {
          new: true,
          protected: true
        }
      )
    )

    .then(profile => myProfile = profile)
    .then(() =>
      Profile.findOneAndUpdate (
        {userName: to},
        {
          $push: {
            'requests.received.accepted': _id,
            'contacts': fromID
          },
          $pull: {'requests.received.pending': _id}
        },
        {
          new: true,
          protected: true
        }
      )
    )

    .then(profile => {

      socketio.sockets.emit(`${updatedRequest.to}-newContact`, profile);
      socketio.sockets.emit(`${updatedRequest.from}-newContact`, myProfile);
      socketio.sockets.emit(`${updatedRequest._id}-updateRequest`, updatedRequest);
      res.json(updatedRequest);

    })
    .catch(err => next(createError(400, err)));
  });

  return requestRouter;
};
