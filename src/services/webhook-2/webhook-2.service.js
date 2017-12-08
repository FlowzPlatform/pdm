// Initializes the `webhook2` service on path `/webhook-2`
const createService = require('feathers-rethinkdb');
const hooks = require('./webhook-2.hooks');
const filters = require('./webhook-2.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'webhook_2',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/webhook-2', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('webhook-2');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
