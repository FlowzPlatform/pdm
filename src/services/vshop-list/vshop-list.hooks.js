const auth = require('@feathersjs/authentication');
const axios = require('axios');
const config = require('../../config.js');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [
      hook => beforeFind(hook)
    ],
    get: [
      hook => beforeGet(hook)
    ],
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

async function beforeFind(hook){
  let id;
  if (Object.keys(hook.params).length != 0) {

    await axios.get(config.userDetailApi, {headers:{Authorization:  hook.params.headers.authorization}}).then(response => {
      id = response.data.data._id;
    }).catch(error => {
      console.log('Error : ', error); // eslint-disable-line no-console
      hook.result = { error: error };
    });
    let query = {};
    if (hook.params.query.all == '1' && hook.params.query.supplier == 'false') {
      query = { 
        query: { 
          userId: id,
          supplier: 'false',
          userType: 'supplier',
          $limit: hook.params.query.$limit
        }
      };
    } else if(hook.params.query.all == '1' && hook.params.query.supplier == 'true') {
      query = { 
        query: { 
          userId: id,
          supplier: 'true',
          userType: 'supplier',
          $limit: hook.params.query.$limit
        }
      };
    } else {
      query = { 
        query: { 
          userId: id,
          status: 'completed'
        }
      };
    }
    return hook.app.service('vshopdata').find(query).then(page => {
      hook.result = page.data;
      return hook;
    });
  }
}

function beforeGet(hook) {
  return hook.app.service('vshopdata').find({ 
    query: { 
      userId: hook.id
    }
  }).then(page => {
    hook.result = page.data;
    return hook;
  });
}
