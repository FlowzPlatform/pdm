// Initializes the `categories` service on path `/categories`
const createService = require('./categories.class.js');
const hooks = require('./categories.hooks');
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
  
config.credOptions.type = 'product';

let elasticsearch = require('elasticsearch');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  let esClientOption = {
    index : config.credOptions.index,
    type : config.credOptions.type
  };

  const options = {
    name: 'categories',
    esUrl: config.esUrl,
    esOption: esClientOption,
    elasticsearch:elasticsearch,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/categories', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('categories');

  service.hooks(hooks);
};
