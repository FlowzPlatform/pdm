// Initializes the `product` service on path `/api/products`
const createService = require('./product.class.js');
const hooks = require('./product.hooks');
const filters = require('./product.filters');
const swagger = require('feathers-swagger');
const jwt = require('feathers-authentication-jwt');
const auth = require('feathers-authentication');
var jwt1 = require('jsonwebtoken');
var request = require('request');
const memory = require('feathers-memory');
const productService = memory();
const config = require('../../../config/default.json');

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



module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');


  esClientOption = {
    index : 'pdm1',
    type : 'product'
  }
  const options = {
    name: 'product',
    esUrl: config.esUrl,
    esOption: esClientOption,
    elasticsearch:elasticsearch,
    paginate
  };

  app.configure(swagger({
      docsPath: '/docs',
      prefix: /api\/v\d\//,
      versionPrefix: /v\d/,
      uiIndex: true,
  }))


  // Initialize our service with any options it requires
  app.use('/api/products', createService(options));
  // app.use('/api/products', productService);


  // Get our initialized service so that we can register hooks and filters
  const service = app.service('api/products');



  service.hooks(hooks);

  // console.log(userid)
  service.hooks({
    before: {
        all: [
         hook => check(hook),
         function(hook){
         hook.params.username = hook.data["username"]
       }
      ],
      //  find: function(hook){
      //      hook.params.username = hook.data["username"]
      //  },
       get: [

          //  hook => console.log("&&&&&&&&&&&&&",hook)
       ]

    },
    after: {

    }

  });




  if (service.filter) {
    service.filter(filters);
  }
};

async function check(hook){

 console.log(hook.params.headers.authorization);
 var decoded = jwt1.verify(hook.params.headers.authorization, config.secret);
 console.log(decoded)
 var userid = decoded.userId
 console.log("******************",userid) // bar
 let username = await getUserById(hook,userid)
 hook.data["username"] = username
 return hook

}

function getUserById(hook,userid){
  return new Promise((resolve,reject)=>{
    url = config.auth_url + userid
    var requestObj = {
      url: url,
      headers: {
        'Authorization':  hook.params.headers.authorization,
        'Accept': 'application/json'
      }
    }

     request(requestObj,function (err, response) {
      if (err){
        console.log(err)
      }
      else{
        res = response.body
        parsedResponse = JSON.parse(res)
        console.log(parsedResponse.data);
        username = parsedResponse.data[0].username
        resolve(username)
      }
    })
  })

}
