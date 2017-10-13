'use strict';

const Router = require('express').Router;
const debug = require('debug')(`${process.env.APP_NAME}: Request Router`);
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const profileFetch = require('../lib/profile-fetch.js');
const bearerAuth = require('../lib/bearer.js');
const Request = require('../model/request.js');

module.exports = socketio => {
  let requestRouter = new Router();

  requestRouter.post('/api/friendrequest', jsonParser, bearerAuth, profileFetch, function(req, res, next) {
    debug('POST /api/friendrequest');
    let {_id, userName} = req.body;
    let {profile} = req;

    let friendRequest = new Request({
      from: profile.userName,
      to: userName,
      fromID: profile._id,
      toID: _id
    });

    friendRequest.save()
    .then(request => {
      socketio.broadcast(`${userName}-newRequest`, request);
      res.send(request);
    })
    .catch(err => next(createError(400, err)));
  });



  return requestRouter;
};
