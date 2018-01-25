const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ],
    find: [],
    get: [
      hook => before(hook)
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


function before(hook){
  return hook.app.service('vshopdata').find({
    query: { 
      userId: hook.id,
      status: "completed"
    }
  }).then(page => {
    hook.result = page.data;
    return hook;
  });
}