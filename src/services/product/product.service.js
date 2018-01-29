// Initializes the `product` service on path `/api/products`
const createService = require('./product.class.js');
const hooks = require('./product.hooks');
const swagger = require('feathers-swagger');
const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');
var jwt1 = require('jsonwebtoken');
var request = require('request');
const memory = require('feathers-memory');
const productService = memory();
const config = require('../../config.js');
let elasticsearch = require('elasticsearch');
var username1 = ""

if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl
if(process.env.secret != '')
  config.secret = process.env.secret
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url
if(process.env.pwd != '')
  config.pwd = process.env.pwd
if(process.env.index != '')
  config.credOptions.index = process.env.index

config.credOptions.type = 'product'

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  esClientOption = {
    index : config.credOptions.index,
    type : config.credOptions.type
  }
  const options = {
    name: 'product',
    esUrl: config.esUrl,
    esOption: esClientOption,
    elasticsearch:elasticsearch,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/api/products', createService(options));
  // app.use('/api/products', productService);

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/products');

  service.hooks(hooks);
};
