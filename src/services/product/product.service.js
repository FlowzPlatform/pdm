// Initializes the `product` service on path `/api/products`
const createService = require('./product.class.js');
const hooks = require('./product.hooks');
const config = require('../../config.js');
let elasticsearch = require('elasticsearch');
const auth = require('@feathersjs/authentication');
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

config.credOptions.type = 'product';

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  let esClientOption = {
    index : config.credOptions.index,
    type : config.credOptions.type
  };
  const options = {
    name: 'product',
    esUrl: config.esUrl,
    esOption: esClientOption,
    elasticsearch:elasticsearch,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/products', createService(options));

  const serviceInst = createService(options); // eslint-disable-line no-unused-vars

  app.use('/api/products/:region/:id', {
    find (params) {
      let region = params.route.region;
      let id = params.route.id;
      return serviceInst.getByIdAndCountry(region,id);
    }
  });

  app.service('/api/products/:region/:id').hooks({
    before: {
      all: [
        auth.hooks.authenticate(['jwt']),
        hook => authenticateUser(hook)
      ]
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
  const service = app.service('api/products');

  service.hooks(hooks);
};
