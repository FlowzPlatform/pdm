const vm = require('../vidMiddleware.js');
const config = require('../../config.js');

module.exports = {
  before: {
    all: [
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

async function getUsername (hook) {
  if (Object.keys(hook.params).length !== 0) {
    await vm.check(hook.app.service('vshopdata'), hook.params.headers.vid, true)
      .then(response => {
        config.credOptions.username = response[0];
        config.credOptions.password = response[1];
        hook.params.credential = response;
      });
  }
}