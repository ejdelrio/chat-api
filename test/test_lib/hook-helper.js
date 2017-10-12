'use strict';

const templates = require('./template.js');

const User = require('../../model/user.js');
const Profile = require('../../model/profile.js');

let helper = module.exports = {};

helper.users = {};
helper.tokens = {};
helper.profiles = {};
helper.models = {};

helper.url = `http://localhost:${process.env.PORT}/api`;

helper.createUser = templateName => {

  return new Promise((resolve, reject) => {
    let testUser = new User(templates[templateName]);
    let testProfile = new Profile(templates[templateName]);
    testProfile.userID = testUser._id;
    testProfile.save()
    .then(() => testUser.encryptPassWord(testUser.passWord))
    .then(user => {
      helper.users[templateName] = user;
      return user.signToken();
    })
    .then(token => {
      helper.tokens[templateName] = token;
      resolve(token);
    })
    .catch(err => reject(err));
  });
};

helper.createModel = (modelName, modelSchema, profileName) => {
  return new Promise((resolve, reject) => {
    let newModel = new modelSchema(templates[modelName]);
    newModel.profileID = helper.profiles[profileName]._id;
    newModel.save()
    .then(model => resolve(model))
    .catch(err => reject(err));
  });
};


helper.clearDB = () => {
  return Promise.all([
    User.remove({}),
    Profile.remove({})
  ])
  .then(() => {
    helper.users = {};
    helper.tokens = {};
    helper.models = {};
    helper.profiles = {};
  });
};
