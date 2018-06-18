// import { create } from 'domain';
const config = require('../../config.js');
// const errors = require('@feathersjs/errors');
// const feathers = require('feathers');
const vm = require('../vidMiddleware.js');
const request = require('request');


let skip = 0;
let limit = 10;
let esURL = config.esUrl;
esURL = esURL.substr(8);
let uri = 'https://' + config.credOptions.username + ':' + config.credOptions.password + '@' + esURL + '/' + config.credOptions.index + '/_search';

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup(app){
    this.app = app;
  }

  async find (params) {
    if (params.query.$skip != undefined && params.query.$skip != '') {
      skip = parseInt(params.query.$skip);
    } else {
      skip = 0;
    }
    if (params.query.$limit != undefined && params.query.$limit != '') {
      limit = parseInt(params.query.$limit);
    } else {
      limit = 10;
    }
    let getAllResult;
    let queryBody = {
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 
                  'bool' : {
                    'must' : []
                  }
                }
              ]
            }
          }
        }
      }
    };
    try {
      if (Object.keys(params.query).length == 0) {
        queryBody.query = {
          'bool' : {
            'must': {
              'match_all': {}
            }
          }
        };
        //  Uncomment if you wants to throw error when no search params in get request
        // throw new errors.NotFound('No parameters to search')  
      } else {
        Object.keys(params.query).forEach(function(key){
          if ([key] != 'source' && [key] != '$skip' && [key] != '$limit') { // eslint-disable-line no-constant-condition
            [key] == 'sku' ? queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match_phrase' : {[key] : params.query[key]} }) : queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match' : {[key] : params.query[key]} }); // eslint-disable-line no-constant-condition
          } else {
            let array;
            if (params.query.source != '' && params.query.source != undefined) {
              array = params.query.source.split(',').map(String);
            }
            queryBody._source = array;
          }
        });
      }
    } catch (err) {
      console.log('Error Catch : ', err); // eslint-disable-line no-console
    }
    getAllResult = await this.getResultFromES(queryBody);
    return getAllResult;
  }

  async get (language, params) {
    if (params.query.$skip != undefined && params.query.$skip != '') {
      skip = parseInt(params.query.$skip);
    } else {
      skip = 0;
    }
    if (params.query.$limit != undefined && params.query.$limit != '') {
      limit = parseInt(params.query.$limit);
    } else {
      limit = 10;
    }
    let queryBody = {
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 'bool' : {
                  'must' : [
                    { 'match' : {'country' : language} }
                  ]
                }
                }
              ]
            }
          }
        }
      }
    };
    if (language == undefined) {
      delete queryBody.query.bool.filter.bool.should[0].bool.must[0];
    }
    try {
      if (!Object.keys(params).length == 0) {
        Object.keys(params.query).forEach(function(key){
          if ([key] != 'source' && [key] != '$skip' && [key] != '$limit') { // eslint-disable-line no-constant-condition
            [key] == 'sku' ? queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match_phrase' : {[key] : params.query[key]} }) : queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match' : {[key] : params.query[key]} }); // eslint-disable-line no-constant-condition
          } else {
            let array;
            if (params.query.source != '' && params.query.source != undefined) {
              array = params.query.source.split(',').map(String);
            }
            queryBody._source = array;
          }
        });
      }
    } catch (err) {
      console.log('Error Catch : ', err); // eslint-disable-line no-console
    }
    let searchResult = await this.getResultFromES(queryBody);
    return searchResult;
  }

  async create (data, params) {
    let query = '';
    let country = '';
    if (data.query !== undefined && data.query !== '') {
      query = data.query;
    }
    let searchResult = await this.getDataFromES(query, params, country);
    return searchResult;
  }

  _setup(app, path) {
    var self = this;
    app.post('/' + path + '/:country',async function (req, res, err) {
      // let flag = false
      if (err && err === 'route') {
        return done(); // eslint-disable-line no-undef
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          req.params.credential = response;
        });
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else 
      if (req.params.credential[2]) {
        res.send(req.params.credential[2]);
      } else {
        req.feathers.query = req.query;
        let searchResult = await self.getDataFromES(req.body.query, req.feathers, req.params.country);
        console.log('info: after: pdm - Method: custom create'); // eslint-disable-line no-console
        res.send(searchResult);
      }
    });
    app.post('/:index//:action', async function (req, res, err) {
      var country;
      // let flag = false
      if (err & err === 'router') {
        return done(err); // eslint-disable-line no-undef
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          req.params.credential = response;
        });
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else 
      if (req.params.credential[2]) {
        res.send(req.params.credential[2]);
      } else {
        let searchResult = await self.get(country, {query: req.query});
        console.log('info: after: pdm - Method: // custom create'); // eslint-disable-line no-console
        res.send(searchResult);
      }
    });
    app.post('/:index/', async function (req, res, err) {
      // let flag = false
      if (err & err === 'router') {
        return done(err); // eslint-disable-line no-undef
      }
      // jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) {
      //   if(err) {
      //     flag = true
      //   }
      // })
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          req.params.credential = response;
        });
      // if (flag) {
      //   var er = new errors.NotAuthenticated('No auth token')
      //   res.send(er)
      // } else 
      if (req.params.credential[2]) {
        res.send(req.params.credential[2]);
      } else {
        let searchResult = await self.get(req.params.index, req.feathers);
        console.log('info: after: pdm - Method: / custom create'); // eslint-disable-line no-console
        res.send(searchResult);
      }
    });
    app.post('/'+ path +'/run/fullquery', async function (req, res, err) {
      if (err && err === 'route') {
        return done(); // eslint-disable-line no-undef
      }
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          req.params.credential = response;
        });
      if (req.params.credential[2]) {
        res.send(req.params.credential[2]);
      } else {
        let searchResult = await self.getResultFromES(req.body);
        console.log('info: after: pdm - Method: custom fullquery'); // eslint-disable-line no-console
        res.send(searchResult);
      }
    });
  }
  
  getResultFromES(query) {
    skip == 0 && limit == 10 ? uri = 'https://' + config.credOptions.username + ':' + config.credOptions.password + '@' + esURL + '/' + config.credOptions.index + '/_search' : uri = 'https://' + config.credOptions.username + ':' + config.credOptions.password + '@' + esURL + '/' + config.credOptions.index + '/_search?from=' + skip + '&size=' + limit;
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
      request({method: 'post', url: uri, json: true, body: query}, function (error, response, body) { // eslint-disable-line no-unused-vars
        if (error) {
          resolve(error);
        } else {
          resolve(response.body);
        }
      });
    });
  }

  async getDataFromES (query, params, country) {
    if (params.query.$skip != undefined && params.query.$skip != '') {
      skip = parseInt(params.query.$skip);
    } else {
      skip = 0;
    }
    if (params.query.$limit != undefined && params.query.$limit != '') {
      limit = parseInt(params.query.$limit);
    } else {
      limit = 10;
    }
    let queryBody = {
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 'bool' : {
                  'must' : [
                    { 'match' : {'country' : country} }
                  ]
                }
                }
              ]
            }
          },
          'must': {
            'match_all': {}
          }
        }
      }
    };
    if (query !== undefined && query !== '') {
      queryBody.query.bool.must = query;
    }
    if (country == '') {
      queryBody.query = query;
    }
    try {
      if (!Object.keys(params).length == 0) {
        Object.keys(params.query).forEach(function(key){
          if ([key] != 'source' && [key] != '$skip' && [key] != '$limit') { // eslint-disable-line no-constant-condition
            [key] == 'sku' ? queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match_phrase' : {[key] : params.query[key]} }) : queryBody.query.bool.filter.bool.should[0].bool.must.push({ 'match' : {[key] : params.query[key]} }); // eslint-disable-line no-constant-condition
          } else {
            let array;
            if (params.query.source != '' && params.query.source != undefined) {
              array = params.query.source.split(',').map(String);
            }
            queryBody._source = array;
          }
        });
      }
    } catch (err) {
      console.log('Error Catch : ', err); // eslint-disable-line no-console
    }
    let searchResult = await this.getResultFromES(queryBody);
    return searchResult;
  }

  update (id, data, params) { // eslint-disable-line no-unused-vars
    return Promise.resolve(data);
  }

  patch (id, data, params) { // eslint-disable-line no-unused-vars
    return Promise.resolve(data);
  }

  remove (id, params) { // eslint-disable-line no-unused-vars
    return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
