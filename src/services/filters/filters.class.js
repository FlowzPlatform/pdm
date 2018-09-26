const config = require('../../config.js');
if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl;
if(process.env.secret != '')
  config.secret = process.env.secret;
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url;
if(process.env.pwd != '')
  config.pwd = process.env.pwd;
    
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    let attribute_key = params.query.attribute_key;
    if(attribute_key == undefined){
      let bodyData = {
        'size' : 0,
        'aggregations': {
          'colors': {
            'terms': {
              'field': 'attributes.colors.raw',
              'size': 1000
            }
          },
          'shape': {
            'terms': {
              'field': 'attributes.shape.keyword',
              'size': 1000
            }
          },
          'decimal': {
            'terms': {
              'field': 'attributes.decimal.keyword',
              'size': 1000
            }
          },
          'imprint color': {
            'terms': {
              'field': 'attributes.imprint color.keyword',
              'size': 1000
            }
          }
        }
      };
      let searchResult = this.getResultFromES(bodyData,params);
      return Promise.resolve(searchResult);
    }
    else{
      if(attribute_key == 'colors'){
        let bodyData ={
          'size': 0,
          'aggs': {
            'group_by_attributes' : {
              'terms': {
                'field': 'attributes.' + attribute_key + '.raw',
                'size': 1000
              }
            }
          }
        };
        let searchResult = this.getResultFromES(bodyData,params);
        return Promise.resolve(searchResult);
      }
      else if(attribute_key == 'username'){
        let bodyData ={
          'size': 0,
          'aggs': {
            'group_by_attributes' : {
              'terms': {
                'field': 'supplier_info.username.keyword',
                'size': 1000
              }
            }
          }
        };
        let searchResult = this.getResultFromES(bodyData,params);
        return Promise.resolve(searchResult);
      }
      else{
        let bodyData ={
          'size': 0,
          'aggs': {
            'group_by_attributes': {
              'terms': {
                'field': 'attributes.' + attribute_key + '.keyword',
                'size': 1000
              }
            }
          }
        };
        let searchResult = this.getResultFromES(bodyData,params);
        return Promise.resolve(searchResult);
      }
    }
  }

  get (attribute_key , params) {
    if(attribute_key == 'colors'){
      let bodyData ={
        'size': 0,
        'aggs': {
          'group_by_attributes' : {
            'terms': {
              'field': 'attributes.' + attribute_key + '.raw',
              'size': 1000
            }
          }
        }
      };
      let searchResult = this.getResultFromES(bodyData,params);
      return Promise.resolve(searchResult);
    }
    else if(attribute_key == 'linename'){
      let bodyData = {
        'size': 0,
        'aggs': {
          'group_by_linename' : {
            'terms': {
              'field': 'linename.raw',
              'size': 1000
            }
          }
        }
      };
      let searchResult = this.getResultFromES(bodyData,params);
      return Promise.resolve(searchResult);

    }
    else if(attribute_key == 'username'){
      let bodyData = {
        'size': 0,
        'aggs': {
          'group_by_username' : {
            'terms': {
              'field': 'supplier_info.username.keyword',
              'size': 1000
            }
          }
        }
      };
      let searchResult = this.getResultFromES(bodyData,params);
      return Promise.resolve(searchResult);

    }
    else{
      let bodyData ={
        'size': 0,
        'aggs': {
          'group_by_attributes': {
            'terms': {
              'field': 'attributes.' + attribute_key + '.keyword',
              'size': 1000
            }
          }
        }
      };
      let searchResult = this.getResultFromES(bodyData,params);
      return Promise.resolve(searchResult);
    }
  }

  //   create (data, params) {
  //     if (Array.isArray(data)) {
  //       return Promise.all(data.map(current => this.create(current)));
  //     }
  //
  //     return Promise.resolve(data);
  //   }
  //
  //   update (id, data, params) {
  //     return Promise.resolve(data);
  //   }
  //
  //   patch (id, data, params) {
  //     return Promise.resolve(data);
  //   }
  //
  //   remove (id, params) {
  //     return Promise.resolve({ id });
  //   }
  // }
  async getResultFromES(bodyData,params) { // eslint-disable-line no-unused-vars
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = config.credOptions.username;
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

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
