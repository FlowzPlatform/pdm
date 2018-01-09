var rpRequest = require('request')
const jwt = require('@feathersjs/authentication-jwt');
var jwt1 = require('jsonwebtoken');
const auth = require('@feathersjs/authentication');
var express = require('express')
var app = express()
var request = require('request')
const logintoken = ""


module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
