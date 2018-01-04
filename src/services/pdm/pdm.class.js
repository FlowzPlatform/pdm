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
  'index' : 'XXXXXX',
  'usernname': 'XXXXX',
  'password': 'XXXXX'
}
const esURL = 'XXXXXXXXX'
const uri = 'https://' + credOptions.usernname + ':' + credOptions.password + esURL + '/' + credOptions.index + '/_search'
const keywords = ['country', 'sku', 'text', 'product_name', 'categories']
const Esearch = ['country', 'sku', ['product_name', 'search_keyword', 'description'], 'product_name', 'categories']
const query = {
  "query" : {
    "bool" : {
      "filter" : {
        "bool" : {
          "should" : [
            { "bool" : {
              "must" : [
                  { "match" : "" }
                ]
              }
            }
          ]
        }
      }
    }
  }
}
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    // {"country" : params.query.country}
    console.log('params', params)
    let getAllResult = await this.getAllResultFromES(params)
    return getAllResult
  }

  getAllResultFromES(params) {
    return new Promise((resolve, reject) => {
      request({method: 'post', url: uri}, function (error, response, body) {
        if (error) {
          resolve(error)
        } else {
          let body = JSON.parse(response.body)
          resolve(body.hits.hits)
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
          resolve(response.body.hits.hits)
        }
      })
    })
  }

  create (data, params) {
    console.log('data', data)
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }
    return Promise.resolve(data);
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
