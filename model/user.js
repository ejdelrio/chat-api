'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('chat: User Model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  passWord: {type: String, required: true},
  token: {type: String, required: true, unique: true}
});

const User = module.export = mongoose.model('user', userSchema);

userSchema.methods.encryptPassWord = function(passWord) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(10, passWord, (err, hash) => {
      if(err) return reject(err);
      resolve(hash);
    });
  });
};

userSchema.methods.comparePassWord = function(passWord) {
  return new Promise((resolve, reject) => {
    bcrypt.compate(passWord, this.passWord, (err, valid) => {
      if(err) reject(err);
      if(!valid) reject();
    });
  });
};
