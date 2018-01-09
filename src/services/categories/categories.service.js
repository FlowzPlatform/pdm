// Initializes the `categories` service on path `/categories`
const createService = require('./categories.class.js');
const hooks = require('./categories.hooks');
const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');
var jwt1 = require('jsonwebtoken');
var request = require('request')
const config = require('../../../config/default.json');
if (process.env.esUrl != '')
    config.esUrl = process.env.esUrl
if(process.env.secret != '')
    config.secret = process.env.secret
if(process.env.auth_url != '')
    config.auth_url = process.env.auth_url
if(process.env.pwd != '')
    config.pwd = process.env.pwd

let elasticsearch = require('elasticsearch');

module.exports = function () {
  const app = this;
  const paginate = app.get('paginate');

  esClientOption = {
    index : 'pdm1',
    type : 'product'
  }

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
  service.hooks({
    before: {
        all: [
         hook => check(hook),
         function(hook){
         hook.params.username = hook.data["username"]
       }
      ],
       get: [

       ]

    },
    after: {

    }

  });
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
