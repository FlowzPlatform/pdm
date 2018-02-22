const auth = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const axios = require('axios');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [
      hook => before(hook)
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


async function before(hook){
  let id
  if (Object.keys(hook.params).length != 0) {
    await axios.get('http://api.flowzqa.tk/auth/api/userdetails', {headers:{Authorization:  hook.params.headers.authorization}})
    .then(response => {
      id = response.data.data._id
    })
    .catch(error => {
      console.log('Error : ', error)
    })
    let query = {}
    if (hook.params.query.all == '1') {
      query = { 
        query: { 
          userId: id
        }
      }
    } else {
      query = { 
        query: { 
          userId: id,
          status: 'completed'
        }
      }
    }
    return hook.app.service('vshopdata').find(query).then(page => {
      hook.result = page.data;
      return hook;
    });
  }
}

function beforeGet(hook) {
  console.log(hook.id)
  return hook.app.service('vshopdata').find({ 
    query: { 
      userId: hook.id
    }
  }).then(page => {
    hook.result = page.data;
    return hook;
  });
}
