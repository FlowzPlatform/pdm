const auth = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
var rp = require('request-promise');
var axios = require('axios');
let errors = require('@feathersjs/errors') ;
const config = require('../../config.js');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [
      hook => throwError(hook)
    ],
    get: [
      hook => before(hook)
    ],
    create: [
      hook => create(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => after(hook)
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
let c = ''

async function create(hook){
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    let a = hook.data.virtualShopName
    let b = res.id;
    c = hook.data.suppliers;
    hook.data = {};
    hook.data.virtualShopName= a;
    hook.data.userId= b;
    hook.data.status= 'pending';
  }
}

async function after(hook){
  if(hook.data.id) {
    let res = await validateUser(hook);
    if(res.code == 401){
      throw new errors.NotAuthenticated('Invalid token');
    }else{
      hook.app.service('vshop-detail').create({
        "id":hook.result.id,
        "suppliers":c
      })

      let body = {
        "connection" : {
          "host": config.rethinkdb.servers[0].host,
          "port": config.rethinkdb.servers[0].port,
          "db": config.rethinkdb.db
        },
        "queue" : {
          "name": "importData"
        },
        "vId": hook.result.id,
        "userdetail":{
          "emailId": res.email,
          "password": res.password,
          "userId": res.id
        }
      }
      let response = {
        method: 'POST',
        url: config.jobQueue.url,
        json: true,
        body: body
      }
      const jobQueueRes = rp(response);
      //----------------------  send in job queue  const jobQueueRes = rp(response);
      // axios.post(config.jobQueue.url, body)
      // .then(res => {
      //   console.log('Job-queue entry done')
      // })
      // .catch(err => {
      //   throw new errors.NotAcceptable('Error during insertion in job-queue')
      // })
    }     
  }
}

validateUser = async data =>{
  return await axios.get(config.userDetailApi, {headers: {Authorization: apiHeaders.authorization}})
  .then(parsedBody => {
    let userData = {
      'id': parsedBody.data.data._id,
      'email': parsedBody.data.data.email,
      'password': parsedBody.data.data.password
    }
    return userData
  })
  .catch(function (err) {
    return {"code" : 401 }
  })
}

function before(hook) {
  if(hook.id != undefined) {
    return hook;
  } else {
    throw new errors.NotAcceptable('Please provide id to search')
  }
}

function throwError(hook) {
  if(hook.params.query.userId != undefined) {
    return hook;
  } else {
    throw new errors.NotAcceptable('Please provide id to search')
  }
}