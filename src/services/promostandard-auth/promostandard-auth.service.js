// Initializes the `promostandard-auth` service on path `/promostandard-auth`
const createService = require('feathers-rethinkdb');
const hooks = require('./promostandard-auth.hooks');
const filters = require('./promostandard-auth.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'promostandard_auth',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/promostandard-auth', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('promostandard-auth');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
