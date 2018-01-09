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
    find: [

    //  hook => console.log("find")
    ],
    get: [
    //  hook => console.log("get")
      //hook => console.log('before find hook 1 ran'),
      //hook => webHookSubscribe(hook),
      //hook => console.log('before find hook 2 ran')
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      // verify()
      //  hook => check(hook)
      //  hook => console.log("&&&&&&&&&&&&&",hook)

    ],
    find: [],
    get: [
    //hook => console.log('after get hook 1 ran'),
    // hook => webHookSubscribe(hook),
    //hook => console.log('after get hook 2 ran')
    ],
    create: [
    ],
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
  console.log("=======hook call====",hook.result)
  // new Promise((resolve, reject) => {
       notifyWebHooks(hook)
  //     resolve(hook)
  // })
  // return hook
}


function notifyWebHooks (hook) {
  let formData1 = {'service': hook.path, 'productid': hook.id}
  try {
    hook.app.service('subscribe-to-web-hooks').find().then((result) => {
      result.data.forEach((webhook) => {
        console.log("=======notify web hook call====")
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
    console.log("error", e)
  }
}
