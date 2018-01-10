// import { create } from 'domain';
/* eslint-disable no-unused-vars */
const config = require('../../../config/default.json');
const errors = require('@feathersjs/errors');
const feathers = require('feathers');
const rest = require('feathers-rest');

var jwt1 = require('jsonwebtoken');
var request = require('request');

if (process.env.esUrl != '')
    config.esUrl = process.env.esUrl
if(process.env.secret != '')
    config.secret = process.env.secret
if(process.env.auth_url != '')
    config.auth_url = process.env.auth_url
if(process.env.pwd != '')
    config.pwd = process.env.pwd

var credOptions = {
  'index' : process.env.index,
  'username': '',
  'password': process.env.pwd
}

var esURL = config.esUrl
esURL = esURL.substr(8)
let uri = 'https://' + credOptions.username + ':' + credOptions.password + '@' + esURL + '/' + credOptions.index + '/_search'

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
  }

  async find (params) {
    if (params.headers.vid) {
      await this.app.service('vshopdata').get(params.headers.vid)
      .then(response => {
        credOptions.username = response.esUser
      }).catch(err => {
          console.log(err)
      })
    } else {
      throw new errors.Forbidden('Unauthorized access')
    }

    let getAllResult
    let queryBody = {
      "query" : {
        "bool" : {
          "filter" : {
            "bool" : {
              "should" : [
                { 
                  "bool" : {
                    "must" : []
                  }
                }
              ]
            }
          }
        }
      }
    }
    if (Object.keys(params.query).length == 0) {
      throw new errors.NotFound('No parameters to search')  
    } else {
      Object.keys(params.query).forEach(function(key){
        queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
      })
      getAllResult = await this.getResultFromES(queryBody, params)
    }
    return getAllResult
  }

  async get (language, params) {
    if (params.headers.vid) {
      await this.app.service('vshopdata').get(params.headers.vid)
      .then(response => {
        credOptions.username = response.esUser
      }).catch(err => {
        console.log(err)
      })
    } else {
      throw new errors.Forbidden('Unauthorized access')
    }

    let queryBody = {
      "query" : {
        "bool" : {
          "filter" : {
            "bool" : {
              "should" : [
                { "bool" : {
                  "must" : [
                      { "match" : {"country" : language} }
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    }
    if (language == undefined) {
      delete queryBody.query.bool.filter.bool.should[0].bool.must[0]
    }
    if (!Object.keys(params.query).length == 0) {
      Object.keys(params.query).forEach(function(key){
        queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
      })
    }
    let searchResult = await this.getResultFromES(queryBody, params)
    return searchResult
  }

  async create (data, params) {
    if (params.headers.vid) {
      await this.app.service('vshopdata').get(params.headers.vid)
      .then(response => {
        credOptions.username = response.esUser
      }).catch(err => {
          console.log(err)
      })
    } else {
      throw new errors.Forbidden('Unauthorized access')
    }

    let query = ''
    let country = ''
    if (data.query !== undefined && data.query !== '') {
      query = data.query
    }
    let searchResult = await this.getDataFromES(query, params, country)
    return searchResult
  }

  _setup(app, path) {
    var self = this;
    app.post('/' + path + '/:country',async function (req, res, err) {
      if (err && err === 'router') {
        return done(err)
      }
      let searchResult = await self.getDataFromES(req.body.query, req.feathers, req.params.country)
      console.log('info: after: pdm - Method: custom create')
      res.send(searchResult)
    })
    app.post('/:index//:action', async function (req, res, err) {
      var country
      if (err & err === 'router') {
        return done(err)
      }
      let searchResult = await self.get(country, {headers: {vid: req.feathers.headers.vid}, query: req.query})
      res.send(searchResult)
    })
    app.post('/:index/', async function (req, res, err) {
      var country = 'US'
      if (err & err === 'router') {
        return done(err)
      }
      let searchResult = await self.get(country, req.feathers)
      res.send(searchResult)
    })
  }

  // getAllResultFromES(params) {
  //   return new Promise((resolve, reject) => {
  //     request({method: 'post', url: uri}, function (error, response, body) {
  //       if (error) {
  //         resolve(error)
  //       } else {
  //         resolve(response.body)
  //       }
  //     })
  //   })
  // }
  
  getResultFromES(query, params) {
    uri = 'https://' + credOptions.username + ':' + credOptions.password + '@' + esURL + '/' + credOptions.index + '/_search'
    return new Promise((resolve, reject) => {
      request({method: 'post', url: uri, json: true, body: query}, function (error, response, body) {
        if (error) {
          resolve(error)
        } else {
          resolve(response.body)
        }
      })
    })
  }

  async getDataFromES (query, params, country) {
    if (params.headers.vid) {
      await this.app.service('vshopdata').get(params.headers.vid)
      .then(response => {
        credOptions.username = response.esUser
      }).catch(err => {
          console.log(err)
      })
    } else {
      throw new errors.Forbidden('Unauthorized access')
    }

    let queryBody = {
      "query" : {
        "bool" : {
          "filter" : {
            "bool" : {
              "should" : [
                { "bool" : {
                  "must" : [
                      { "match" : {"country" : country} }
                    ]
                  }
                }
              ]
            }
          },
          "must": {
            "match_all": {}
          }
        }
      }
    }
    if (query !== undefined && query !== '') {
      queryBody.query.bool.must = query
    }
    if (country == '') {
      queryBody.query = query
    }
    let searchResult = await this.getResultFromES(queryBody, params)
    return searchResult
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
