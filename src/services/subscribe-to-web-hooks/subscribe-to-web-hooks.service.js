// Initializes the `SubscribeToWebHooks` service on path `/subscribe-to-web-hooks`
const createService = require('feathers-rethinkdb');
const hooks = require('./subscribe-to-web-hooks.hooks');
const filters = require('./subscribe-to-web-hooks.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'subscribe_to_web_hooks',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/subscribe-to-web-hooks', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('subscribe-to-web-hooks');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
