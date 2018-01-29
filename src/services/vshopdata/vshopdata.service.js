// Initializes the `vshopdata` service on path `/vshopdata`
const createService = require('feathers-rethinkdb');
const hooks = require('./vshopdata.hooks');
const config = require('../../config.js');

module.exports = function () {
  const app = this

  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'vshopdata',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/vshopdata', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('vshopdata');

  service.hooks(hooks);
};
