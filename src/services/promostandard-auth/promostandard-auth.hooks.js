
const feathersErrors = require('feathers-errors');
const errors = feathersErrors.errors;
const config = require('../../config.js');
const axios = require('axios');

module.exports = {
  before: {
    all: [
      hook => userAuth(hook)
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

async function userAuth(hook) {
  let auth_token;
  if (hook.params.headers.username == undefined) {
    throw new errors.GeneralError('Please provide username.');
  } else if(hook.params.headers.password == undefined) {
    throw new errors.GeneralError('Please provide password.');
  } else {
    auth_token = await (axios.post(config.loginUrl, {'email': hook.params.headers.username, 'password': hook.params.headers.password}).then(response => {
      return response.data.logintoken;
    }).catch(error => {
      return error;
    }));
  }
  if( auth_token  instanceof Error ) {
    hook.result = { error: auth_token.response.data };
  } else {
    let query = { 
      query: { 
        all: 1,
        supplier: 'true',
        status: 'completed'
      },
      headers: { authorization: auth_token }
    }
    return hook.app.service('vshop-list').find(query).then(page => {
     /*  let obj = []
      for(let item in page) {
        obj.push({ 'vid': page[item].id })
      } */
      // console.log('>>>>>..', page[0].id)
      hook.result = {'vid': page[0].id};
      return hook;
    });
  }
}