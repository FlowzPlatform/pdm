// import { create } from 'domain';
/* eslint-disable no-unused-vars */
const config = require('../../../config/default.json');
const errors = require('@feathersjs/errors');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/express/rest');
const vm = require('../vidMiddleware.js');

var jwt = require('jsonwebtoken');
var request = require('request');

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

var esURL = config.esUrl
esURL = esURL.substr(8)
let uri = 'https://' + config.credOptions.username + ':' + config.credOptions.password + '@' + esURL + '/' + config.credOptions.index + '/_search'

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
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
      queryBody.query = {
        "bool" : {
          "must": {
            "match_all": {}
          }
        }
      }
      //  Uncomment if you wants to throw error when no search params in get request
      // throw new errors.NotFound('No parameters to search')  
    } else {
      Object.keys(params.query).forEach(function(key){
        queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
      })
    }
    getAllResult = await this.getResultFromES(queryBody, params)
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
    if (language == undefined) {
      delete queryBody.query.bool.filter.bool.should[0].bool.must[0]
    }
    try {
      if (!Object.keys(params).length == 0) {
        Object.keys(params.query).forEach(function(key){
          queryBody.query.bool.filter.bool.should[0].bool.must.push({ "match" : {[key] : params.query[key]} })
        })
      }
    } catch (err) {
      console.log('Error :', err) 
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
      // let flag = false
      if (err && err === 'route') {
        return done()
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
      .then(response => {
        config.credOptions.username = response[0]
        config.credOptions.password = response[1]
        req.params.credential = response
      })
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else 
      if (req.params.credential[2]) {
        res.send(req.params.credential[2])
      } else {
        let searchResult = await self.getDataFromES(req.body.query, req.feathers, req.params.country)
        console.log('info: after: pdm - Method: custom create')
        res.send(searchResult)
      }
    })
    app.post('/:index//:action', async function (req, res, err) {
      // let flag = false
      if (err & err === 'router') {
        return done(err)
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
      .then(response => {
        config.credOptions.username = response[0]
        config.credOptions.password = response[1]
        req.params.credential = response
      })
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else
      if (req.params.credential[2]) {
        res.send(req.params.credential[2])
      } else {
        let searchResult = await self.find({headers: req.feathers.headers, query: req.query})
        console.log('info: after: pdm - Method: // custom create')
        res.send(searchResult)
      }
    })
    app.post('/:index/', async function (req, res, err) {
      let flag = false
      if (err & err === 'router') {
        return done(err)
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
      .then(response => {
        config.credOptions.username = response[0]
        config.credOptions.password = response[1]
        req.params.credential = response
      })
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else
      if (req.params.credential[2]) {
        res.send(req.params.credential[2])
      } else {
        let searchResult = await self.get(req.params.index, req.feathers)
        console.log('info: after: pdm - Method: / custom create')
        res.send(searchResult)
      }
    })
  }
  
  getResultFromES(query, params) {
    uri = 'https://' + config.credOptions.username + ':' + config.credOptions.password + '@' + esURL + '/' + config.credOptions.index + '/_search'
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
