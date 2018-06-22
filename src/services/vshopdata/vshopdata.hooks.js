const auth = require('@feathersjs/authentication');
var axios = require('axios');
let errors = require('@feathersjs/errors');
const config = require('../../config.js');
const _ = require('lodash');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [
      hook => throwError(hook)
    ],
    get: [
      hook => beforeGet(hook)
    ],
    create: [
      hook => beforeCreate(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      hook => rejectSupplier(hook)
    ],
    get: [],
    create: [
      hook => afterCreate(hook)
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
let suppliers = '';

async function beforeCreate(hook){
  let res = await validateUser(hook);
  if(res.code == 401){
    throw new errors.NotAuthenticated('Invalid token');
  }else{
    let virtualShopName = hook.data.virtualShopName;
    let id = res.id;
    let subscriptionId = hook.data.subscriptionId;
    suppliers = hook.data.suppliers;
    hook.data = {};
    hook.data.virtualShopName= virtualShopName;
    hook.data.subscriptionId = subscriptionId;
    hook.data.userId= id;
    hook.data.status= 'pending';
  }
}

async function afterCreate(hook){
  if(hook.data.id) {
    let res = await validateUser(hook);
    if(res.code == 401){
      throw new errors.NotAuthenticated('Invalid token');
    }else{
      hook.app.service('vshop-detail').create({
        'id':hook.result.id,
        'suppliers':suppliers
      }).catch((err) => {
        throw new convertToOtherError(err); // eslint-disable-line
      });

      let body = {
        'connection' : {
          'host': config.rethinkdb.servers[0].host,
          'port': config.rethinkdb.servers[0].port,
          'db': config.rethinkdb.db
        },
        'queue' : {
          'name': 'importData'
        },
        'vId': hook.result.id,
        'userdetail':{
          'emailId': res.email,
          'password': res.password,
          'userId': res.id
        }
      };
      let response = { // eslint-disable-line no-unused-vars
        method: 'POST',
        url: config.jobQueue.url,
        json: true,
        body: body
      };
      // const jobQueueRes = rp(response);
      //----------------------  send in job queue  const jobQueueRes = rp(response);
      axios.post(config.jobQueue.url, body)
        .then(res => { // eslint-disable-line no-unused-vars
          console.log('Job-queue entry done'); // eslint-disable-line no-console
        })
        .catch(err => { // eslint-disable-line no-unused-vars
          throw new errors.NotAcceptable('Error during insertion in job-queue');
        });
    }
  }
}

let validateUser = async (data) => { // eslint-disable-line no-unused-vars
  return await axios.get(config.userDetailApi, {headers: {Authorization: apiHeaders.authorization}}) // eslint-disable-line no-undef
    .then(parsedBody => {
      let userData = {
        'id': parsedBody.data.data._id,
        'email': parsedBody.data.data.email,
        'password': parsedBody.data.data.password
      };
      return userData;
    })
    .catch(function (err) { // eslint-disable-line no-unused-vars
      return {'code' : 401 };
    });
};

function beforeGet(hook) {
  if(hook.id != undefined) {
    return hook;
  } else {
    throw new errors.NotAcceptable('Please provide id to search');
  }
}

function throwError(hook) {
  if (hook.params.query.userType != undefined) {
    if (hook.params.query && hook.params.query.$paginate) {
      hook.params.paginate = hook.params.query.$paginate === 'false' ? false : true;
      delete hook.params.query.$paginate;
    }
    if (hook.params.query.supplier != undefined) {
      if (hook.params.query.supplier == 'false') {
        hook.params.userType = hook.params.query.supplier;
        hook.params.supplier = 'false';
        delete hook.params.query.userType;
      }
      delete hook.params.query.supplier;
    }
    return hook;
  } else if(hook.params.query.userId != undefined) {
    return hook;
  } else {
    throw new errors.NotAcceptable('Please provide id to search');
  }
}

function rejectSupplier(hook) {
  if(hook.params.supplier == 'false') {
    hook.result.data = _.reject(hook.result.data, ['userType', 'supplier']);
  }
}
