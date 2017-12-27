// Initializes the `webhook1` service on path `/webhook-1`
const createService = require('feathers-rethinkdb');
const hooks = require('./webhook-1.hooks');
const filters = require('./webhook-1.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'webhook_1',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/webhook-1', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('webhook-1');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
