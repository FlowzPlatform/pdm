// Initializes the `vshopList` service on path `/vshop-list`
const createService = require('feathers-rethinkdb');
const hooks = require('./vshop-list.hooks');

module.exports = function () {
  const app = this

  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'vshop_list',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/vshop-list', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('vshop-list');

  service.hooks(hooks);
};
