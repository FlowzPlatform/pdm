/* eslint-disable no-unused-vars */
const feathers = require('feathers');
const rest = require('feathers-rest');
var jwt1 = require('jsonwebtoken');
var request = require('request')
var username = ''
const config = require('../../../config/default.json');
if (process.env.esUrl != '')
    config.esUrl = process.env.esUrl
if(process.env.secret != '')
    config.secret = process.env.secret
if(process.env.auth_url != '')
    config.auth_url = process.env.auth_url
if(process.env.pwd != '')
    config.pwd = process.env.pwd

class Service {

  constructor (options) {
    this.options = options || {};
  }



  async find (params) {
    console.log("called....")
    let region = params.query.region
    let bodyData = {
      "query" : {
         "bool" : {
            "filter" : {
               "bool" : {
                 "should" : [
                   { "bool" : {
                     "must" : [
                        { "match" : {"available_regions" : region}},
                       { "bool" : {
                     "must_not" : [
                       { "match" : {"non-available_regions" : region}}
                     ]
                   }}
                     ]
                   }},
                   { "bool" : {
                     "must" : [
                        { "match" : {"available_regions" : ""}},
                       { "match" : {"non-available_regions" : ""}}
                     ]
                   }}
                 ]
              }
            },
              "must": {
                     "match_all": {

                     }
                   }

         }
      }
   }

    let searchResult = this.getResultFromES(bodyData,params)
    return Promise.resolve(searchResult);
  }


async getByIdAndCountry(region,id,req) {
      let bodyData ={
            "query" : {
               "bool" : {
                  "filter" : {
                     "bool" : {
                       "should" : [
                         { "bool" : {
                           "must" : [
                              { "match" : {"available_regions" :region }},
                             { "bool" : {
                           "must_not" : [
                             { "match" : {"non-available_regions" : region}}
                           ]
                         }}
                           ]
                         }},
                         { "bool" : {
                           "must" : [
                              { "match" : {"available_regions" : ""}},
                             { "match" : {"non-available_regions" : ""}}
                           ]
                         }}
                       ]
                    }
                  },
                    "must": {
                           "match": {
                                "_id": id
                           }
                         }

               }
            }
          }
          let username =  await this.check(req,bodyData)
          let searchResult = await this.getResultByBody(bodyData,username)
          return Promise.resolve(searchResult)
             }
  // ...
  _setup(app, path) {
    var self = this;
    app.get('/' + path + '/:region/:id', async function (req, res,err) {
      if(err){
        console.log(err)
      }
      let region = req.params.region
      let id = req.params.id
      let response = await self.getByIdAndCountry(region,id,req);
      res.send(response)
    });
  }

  get (region,params) {
    console.log("get.........")
    let bodyData ={
   "query" : {
      "bool" : {
         "filter" : {
            "bool" : {
              "should" : [
                { "bool" : {
                  "must" : [
                     { "match" : {"available_regions" : region}},
                    { "bool" : {
                  "must_not" : [
                    { "match" : {"non-available_regions" : region}}
                  ]
                }}
                  ]
                }},
                { "bool" : {
                  "must" : [
                     { "match" : {"available_regions" : ""}},
                    { "match" : {"non-available_regions" : ""}}
                  ]
                }}
              ]
           }
         },
           "must": {
                  "match_all": {

                  }
                }

      }
   }
}
    // console.log("@@@@@@@@@@@",bodyData)
    let searchResult = this.getResultFromES(bodyData,params)
    return Promise.resolve(searchResult)
  }


  async check (req,bodyData) {

   console.log(req.headers.authorization);
   var decoded = jwt1.verify(req.headers.authorization, config.secret);
   console.log(decoded)
   var userid = decoded.userId
   console.log("******************",userid) // bar
   let username = await this.getUserById(req,userid)
   return username

   }


   getUserById (req,userid) {
     return new Promise((resolve,reject)=>{
       let url = config.auth_url + userid
       var requestObj = {
         url: url,
         headers: {
           'Authorization':  req.headers.authorization,
           'Accept': 'application/json'
         }
       }

        request(requestObj,function (err, response) {
         if (err){
           console.log(err)
         }
         else{
           let res = response.body
           let parsedResponse = JSON.parse(res)
           console.log(parsedResponse.data);
            username = parsedResponse.data[0].username
           resolve(username)
         }
       })
     })

   }


   async getResultFromES (bodyData,params) {

    // setEsClient(body)
    let  elasticsearch = this.options.elasticsearch;
    let  host = this.options.esUrl;
    let userName = params.username
    let passWord = config.pwd
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+":"+passWord
    })

    let esOptions = this.options.esOption

    let response = await esClient.search({
      index:  esOptions.index,
      type:  esOptions.type,
      body: bodyData
    })
    return response
  }

  async getResultByBody (bodyData,username) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username
    let passWord = config.pwd
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+":"+passWord
    })

    let esOptions = this.options.esOption
    let response = await esClient.search({
      index: esOptions.index,
      type: esOptions.type,
      body: bodyData
    })
    return response
  }
  // create (data, params) {
  //   if (Array.isArray(data)) {
  //     return Promise.all(data.map(current => this.create(current)));
  //   }
  //
  //   return Promise.resolve(data);
  // }
  //
  // update (id, data, params) {
  //   return Promise.resolve(data);
  // }
  //
  // patch (id, data, params) {
  //   return Promise.resolve(data);
  // }
  //
  // remove (id, params) {
  //   return Promise.resolve({ id });
  // }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
