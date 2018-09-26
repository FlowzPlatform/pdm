const vm = require('../vidMiddleware.js');
const config = require('../../config.js');
const auth = require('@feathersjs/authentication');

module.exports = {
  before: {
    all: [
      auth.hooks.authenticate(['jwt']),
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