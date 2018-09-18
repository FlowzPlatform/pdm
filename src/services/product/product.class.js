// const errors = require('@feathersjs/errors');
const config = require('../../config.js');
// const vm = require('../vidMiddleware.js');
// var jwt = require('jsonwebtoken');

class Service {
  constructor (options) {
    this.options = options || {};
  }
  
  async find (params) {
    let region = params.query.region;
    let bodyData = {
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' : region}},
                    { 'bool' : {
                      'must_not' : [
                        { 'match' : {'non-available_regions' : region}}
                      ]
                    }}
                  ]
                }},
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' : ''}},
                    { 'match' : {'non-available_regions' : ''}}
                  ]
                }}
              ]
            }
          },
          'must': {
            'match_all': {

            }
          }

        }
      }
    };
    let searchResult = this.getResultFromES(bodyData);
    return Promise.resolve(searchResult);
  }


  async getByIdAndCountry(region,id) {
    let bodyData ={
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' :region }},
                    { 'bool' : {
                      'must_not' : [
                        { 'match' : {'non-available_regions' : region}}
                      ]
                    }}
                  ]
                }},
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' : ''}},
                    { 'match' : {'non-available_regions' : ''}}
                  ]
                }}
              ]
            }
          },
          'must': {
            'match': {
              '_id': id
            }
          }
        }
      }
    };
    // let username =  await this.check(req,bodyData)
    let searchResult = await this.getResultByBody(bodyData,config.credOptions.username);
    return Promise.resolve(searchResult);
  }

  /* _setup(app, path) {
    var self = this;
    app.get('/' + path + '/:region/:id', async function (req, res, err) {
      let flag = false;
      let region = req.params.region;
      let id = req.params.id;
      if (err && err === 'route') {
        return done(); // eslint-disable-line no-undef
      }
      jwt.verify(req.feathers.headers.authorization, config.secret, function(err, decoded) { // eslint-disable-line no-unused-vars
        if(err) {
          flag = true;
        }
      });
      await vm.check(app.service('vshopdata'), req.feathers.headers.vid, false)
        .then(response => {
          config.credOptions.username = response[0];
          config.credOptions.password = response[1];
          req.params.credential = response;
        });
      if (flag) {
        var er = new errors.NotAuthenticated('No auth token');
        res.send(er);
      } else if (req.params.credential[2]) {
        res.send(req.params.credential[2]);
      } else {
        let response = await self.getByIdAndCountry(region,id);
        console.log('info: after: api/products - Method: custom get'); // eslint-disable-line no-console
        res.send(response);
      }
    });
  } */

  get (region,params) {
    let searchResult = this.getDataFromES(region, params);
    return Promise.resolve(searchResult);
  }

  async getResultFromES (bodyData) {

    // setEsClient(body)
    let  elasticsearch = this.options.elasticsearch;
    let  host = this.options.esUrl;
    let userName = config.credOptions.username;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    let esOptions = this.options.esOption;

    let response = await esClient.search({
      index:  esOptions.index,
      type:  esOptions.type,
      body: bodyData
    });
    return response;
  }

  async getResultByBody (bodyData,username) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    let esOptions = this.options.esOption;
    let response = await esClient.search({
      index: esOptions.index,
      type: esOptions.type,
      body: bodyData
    });
    return response;
  }

  async getDataFromES (region, params, query) {
    let bodyData = {
      'query' : {
        'bool' : {
          'filter' : {
            'bool' : {
              'should' : [
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' : region}},
                    { 'bool' : {
                      'must_not' : [
                        { 'match' : {'non-available_regions' : region}}
                      ]
                    }}
                  ]
                }},
                { 'bool' : {
                  'must' : [
                    { 'match' : {'available_regions' : ''}},
                    { 'match' : {'non-available_regions' : ''}}
                  ]
                }}
              ]
            }
          },
          'must': {
            'match_all': {

            }
          }
        }
      }
    };

    if (query !== undefined && query !== '') {
      bodyData.query.bool.must = query;
    }

    let searchResult = this.getResultFromES(bodyData);
    return Promise.resolve(searchResult);
  }

  create (data, params) {
    if (data.country === undefined || data.country === '') {
      return {'message': 'country required'};
    }
    let query = '';
    if (data.query !== undefined && data.query !== '') {
      query = data.query;
    }
    data = this.getDataFromES (data.country, params, query);
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }
    return Promise.resolve(data);
  }
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
