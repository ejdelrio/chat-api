'use strict';

const Router = require('express').Router;
const debug = require('debug')(`${process.env.APP_NAME}: Profile Router`);
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer.js');
const profileFetch = require('../lib/profile-fetch.js')

const profileRouter = module.exports = new Router();

profileRouter.get('/api/profile', bearerAuth, profileFetch, function(req, res, next) {
  debug('GET /api/profile');

  res.json(req.profile);
  next();
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
