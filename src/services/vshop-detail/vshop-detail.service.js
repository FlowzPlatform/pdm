// Initializes the `vshopDetail` service on path `/vshop-detail`
const createService = require('feathers-rethinkdb');
const hooks = require('./vshop-detail.hooks');

module.exports = function (app) {
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'vshopDetail',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/vshop-detail', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('vshop-detail');

  service.hooks(hooks);
};
