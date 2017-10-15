'use strict';

const createError = require('http-errors');
const Profile = require('../model/profile.js');

module.exports = function(req, res, next) {

  if(!req.user) return next(createError(400, 'User Model Required with Request'));

  Profile.findOne({userID: req.user._id})
  .populate('contacts')
  .populate('requests.sent.accepted')
  .populate('requests.sent.rejected')
  .populate('requests.sent.pending')
  .populate('requests.received.accepted')
  .populate('requests.received.rejected')
  .populate('requests.received.pending')
  .then(profile => {
    req.profile = profile;
    next();
  })
  .catch(err => next(err));
};
