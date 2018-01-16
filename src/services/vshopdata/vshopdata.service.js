// Initializes the `vshopdata` service on path `/vshopdata`
const createService = require('feathers-rethinkdb');
const hooks = require('./vshopdata.hooks');
const config = require('../../../config/default.json');

if (process.env.JQ_HOST != '')
  config.jobQueue.host = process.env.JQ_HOST
if (process.env.JQ_PORT != '')
  config.jobQueue.port = process.env.JQ_PORT
if (process.env.JQ_DB != '')
  config.jobQueue.db = process.env.JQ_DB
if (process.env.JQ_URL != '')
  config.jobQueue.url = process.env.JQ_URL 

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
