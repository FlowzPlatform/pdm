var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;
const config = require('../../../config/default.json');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
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
let userData = ''

async function create(hook){
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    let a = hook.data.virtualShopName
    let b = hook.data.userId;
    c = hook.data.suppliers;
    hook.data = {};
    hook.data.virtualShopName= a;
    hook.data.userId= b;
    hook.data.status= 'pending';
  }
}

async function after(hook){
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
        "host": config.jobQueue.host,
        "port": config.jobQueue.port,
        "db": config.jobQueue.db
      },
      "queue" : {
        "name": "importData"
      },
      "vId": hook.result.id,
      "userdetail":{
        "emailId": userData.email,
        "username": userData.username
      }
    }

    let response = {
      method: 'POST',
      url: config.jobQueue.url,
      json: true,
      body: body
    }
    //----------------------  send in job queue
    const jobQueueRes = await rp(response);
  }
}

validateUser = data =>{
  var options = {
    uri: process.env.userDetailApi,
    headers: {
      Authorization : apiHeaders.authorization
    }
  };
  return new Promise((resolve , reject) =>{
    rp(options)
    .then(function (parsedBody) {
      userData = parsedBody[0]
      resolve(parsedBody)
    })
    .catch(function (err) {
      resolve({"code" : 401 })
    });
  })
}

