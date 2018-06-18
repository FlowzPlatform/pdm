// Initializes the `pdm` service on path `/pdm`
const createService = require('./pdm.class.js');
const hooks = require('./pdm.hooks');
const config = require('../../config.js');

if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl;
if(process.env.secret != '')
  config.secret = process.env.secret;
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url;
if(process.env.pwd != '')
  config.pwd = process.env.pwd;
if(process.env.index != '')
  config.credOptions.index = process.env.index;

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate'); // eslint-disable-line no-unused-vars

  const options = {
    name: 'pdm',
    paginate: false
  };

    // Initialize our service with any options it requires
  app.use('/pdm', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pdm');

  service.hooks(hooks);
};
