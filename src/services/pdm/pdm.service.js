// Initializes the `pdm` service on path `/pdm`
const createService = require('./pdm.class.js');
const hooks = require('./pdm.hooks');
const config = require('../../config.js');
const vm = require('../vidMiddleware.js');

/* if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl;
if(process.env.secret != '')
  config.secret = process.env.secret;
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url;
if(process.env.pwd != '')
  config.pwd = process.env.pwd;
if(process.env.index != '')
  config.credOptions.index = process.env.index; */

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate'); // eslint-disable-line no-unused-vars

  const options = {
    name: 'pdm',
    paginate: false
  };

  
  // Initialize our service with any options it requires
  app.use('/pdm', createService(options));
  
  const serviceInst = createService(options); // eslint-disable-line no-unused-vars
  
  app.use('/pdm/:country', {
    create (data, params) {
      let country = params.route.country;
      return serviceInst.getDataFromES(data.query, params, country);
    }
  });

  app.service('/pdm/:country').hooks({
    before: {
      all: [ hook => authenticateUser(hook) ]
    }
  });

  app.use('/:index//:action', {
    create (data, params) { // eslint-disable-line no-unused-vars
      let country;
      return serviceInst.get(country, {query: data.query});
    }
  });

  app.service('/:index//:action').hooks({
    before: {
      all: [ hook => authenticateUser(hook) ]
    }
  });

  app.use('/pdm/run/fullquery', {
    create (data, params) { // eslint-disable-line
      return serviceInst.getResultFromES(data);
    }
  });

  app.service('/pdm/run/fullquery').hooks({
    before: {
      all: [ hook => authenticateUser(hook) ]
    }
  });

  async function authenticateUser (hook) {
    if (Object.keys(hook.params).length !== 0) {
      await vm.check(hook.app.service('vshopdata'), hook.params.headers.vid, true)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          hook.params.credential = response;
        });
    }
  }

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pdm');
  
  service.hooks(hooks);
};
