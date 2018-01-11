// import { create } from 'domain';
/* eslint-disable no-unused-vars */
const feathers = require('feathers');
const rest = require('feathers-rest');
var jwt1 = require('jsonwebtoken');
var request = require('request');
const config = require('../../../config/default.json');
if (process.env.esUrl != '')
    config.esUrl = process.env.esUrl
if(process.env.secret != '')
    config.secret = process.env.secret
if(process.env.auth_url != '')
    config.auth_url = process.env.auth_url
if(process.env.pwd != '')
    config.pwd = process.env.pwd
const credOptions = {
  'index' : process.env.index,
  'usernname': process.env.user,
  'password': process.env.pwd
}

var esURL = config.esUrl
esURL = esURL.substr(8)
const uri = 'https://' + credOptions.usernname + ':' + credOptions.password + '@' + esURL + '/' + credOptions.index + '/_search'

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
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
      getAllResult = ['Please give parameters to search']     
    } else {
      Object.keys(params.query).forEach(function(key){
        queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
      })
      getAllResult = await this.getResultFromES(queryBody, params)
    }
    return getAllResult
  }

  async get (language, params) {
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
    if (!Object.keys(params.query).length == 0) {
      Object.keys(params.query).forEach(function(key){
        queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
      })
    }
    let searchResult = await this.getResultFromES(queryBody, params)
    return searchResult
  }

  async create (data, params) {
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
      var country = 'CA'
      if (err & err === 'router') {
        return done(err)
      }
      let searchResult = await self.get(country, req.feathers)
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

  getAllResultFromES(params) {
    return new Promise((resolve, reject) => {
      request({method: 'post', url: uri}, function (error, response, body) {
        if (error) {
          resolve(error)
        } else {
          resolve(response.body)
        }
      })
    })
  }
  
  getResultFromES(query, params) {
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
