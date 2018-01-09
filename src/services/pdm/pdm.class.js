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

  async find (params) {
    let getAllResult
    if (params.query == null) {
      getAllResult = ['Query String Parameters Not Found']      
    } else {
      getAllResult = await this.getAllResultFromES(params)
    }
    return getAllResult
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

  async get (language, params) {
    let query = {
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

    let searchResult = await this.getResultFromES(query, params)
    return searchResult
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

  async create (data, params) {
    let query = ''
    let country = ''
    if (data.query !== undefined && data.query !== '') {
      query = data.query
    }
    let searchResult = await this.getDataFromES(query, params, country)
    return searchResult
  }

  async getDataFromES (query, params, country) {
    let bodyData = {
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
      bodyData.query.bool.must = query
    }
    if (country == '') {
      bodyData.query = query
    }
    let searchResult = await this.getResultFromES(bodyData, params)
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
