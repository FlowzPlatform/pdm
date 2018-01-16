var rp = require('request-promise');
let errors = require('@feathersjs/errors') ;

module.exports = {
  before: {
    all: [],
    find: [
      hook => getAllDataByUser(hook)
    ],
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

async function getAllDataByUser(hook){
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    hook.params.query.userId = userData.data._id
  }
}

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
        "host": "47.254.27.134",
        "port": 28015,
        "db": "importDataJobqueue"
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
      url: 'http://localhost:5000/job/create',
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
      userData = JSON.parse(parsedBody)
      resolve(parsedBody)
    })
    .catch(function (err) {
      console.log(err)
      resolve({"code" : 401 })
    });
  })
}

