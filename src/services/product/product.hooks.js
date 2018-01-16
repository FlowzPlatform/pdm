const vm = require('../vidMiddleware.js');
const config = require('../../../config/default.json');
var rpRequest = require('request')
const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');
var jwt1 = require('jsonwebtoken');
var express = require('express')
var app = express()
var request = require('request')
const logintoken = ""

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt']),
      hook => getUsername(hook)
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

function webHookSubscribe (hook) {
  notifyWebHooks(hook)
}


function notifyWebHooks (hook) {
  let formData1 = {'service': hook.path, 'productid': hook.id}
  try {
    hook.app.service('subscribe-to-web-hooks').find().then((result) => {
      result.data.forEach((webhook) => {
        let reqOptions = {
          method: 'POST',
          uri: webhook.webhookurl,
          body: formData1,
          json: true
        }
        rpRequest(reqOptions)
      })
    })
  } catch (e) {
    console.log("Product.hook.js Error :", e)
  }
}

async function getUsername (hook) {
  if (Object.keys(hook.params).length !== 0) {
    await vm.check(hook.app.service('vshopdata'), hook.params.headers.vid, true)
        .then(response => {
          config.credOptions.username = response[0]
          config.credOptions.password = response[1]
          hook.params.credential = response
        })
  }
}