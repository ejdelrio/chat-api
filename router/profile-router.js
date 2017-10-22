'use strict';

const Router = require('express').Router;
const debug = require('debug')(`${process.env.APP_NAME}: Profile Router`);
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer.js');
const ConvoNode = require('../model/convo-node.js');

const profileRouter = module.exports = new Router();

profileRouter.get('/api/profile', bearerAuth, function(req, res, next) {
  debug('GET /api/profile');

  let profileReq;

  Profile.findOne({userName: req.user.userName})
  .populate('contacts')
  .populate('requests.sent.accepted')
  .populate('requests.sent.rejected')
  .populate('requests.sent.pending')
  .populate('requests.received.accepted')
  .populate('requests.received.rejected')
  .populate('requests.received.pending')

  .then(profile => {
    profileReq = profile;
    return Promise.all(profile.convos.map(node => {
      return ConvoNode.findById(node)
      .populate('members')
      .populate({
        path: 'messages',
      })
    }))
  })

  .then(nodeArray => {
    console.log(nodeArray);
    profileReq.convos = nodeArray;
    res.json(profileReq);
  })

  .catch((err => next(createError(404, err))));
});

profileRouter.get('/api/profile-query/:userName', bearerAuth, function(req, res, next) {
  debug('GET /api/profile-query');

  var regexp = new RegExp('^' + req.params.userName);

  Profile.find()
  .where('userName').ne(req.user.userName)
  .or({userName: regexp})
  .limit(30)
  .then(profiles => res.json(profiles))
  .catch(err => next(createError(400, err)));
});

profileRouter.put('/api/profile', jsonParser, bearerAuth, function(req, res, next) {
  debug('PUT /api/profile');

  Profile.findOneAndUpdate(
    {userName: req.user.userName},
    req.body,
    {new: true}
  )
  .then(profile => res.json(profile))
  .catch(error => next(createError(400, error)));
});
