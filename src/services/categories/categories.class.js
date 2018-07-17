const config = require('../../config.js');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) { // eslint-disable-line no-unused-vars
    let bodyData = {
      'size': 0,
      'aggs': {
        'group_by_category' : {
          'terms': {
            'field': 'categories.raw',
            'size': 1000
          }
        }
      }
    };
    let searchResult = this.getResultFromES(bodyData);
    return Promise.resolve(searchResult);
  }

  getBySiteId (site_id, user) {
    let bodyData = {
      'query': {
        'bool' : {
          'must' : [
            { 'match' : {'site_id' : site_id}},
            { 'match' : {'user' : user}}
          ]
        }
      }
    };
    let searchResult = this.getESResultbySite(bodyData,user);
    return Promise.resolve(searchResult);
  }

  getByCategoryId (category_id,user) {
    let bodyData = {
      'query': {
        'bool' : {
          'must' : [
            { 'match' : {'category_list.id' : category_id}},
            { 'match' : {'user' : user}}
          ]
        }
      }
    };
    let searchResult = this.getESResultbySite(bodyData,user);
    return Promise.resolve(searchResult);
  }


  getAllSites(user) {
    let bodyData = {
      'query': {
        'bool' : {
          'must' : [
            { 'match' : {'user' : user}}
          ],
          'must_not': {
            'exists': {
              'field': 'site_id'
            }
          }
        }
      }
    };
    let searchResult = this.getESResultbySite(bodyData,user);
    return Promise.resolve(searchResult);
  }

  getAllSlugs(site_id,user) {
    let bodyData = {
      'query': {
        'bool' : {
          'must' : [
            { 'match' : {'site_id' : site_id}},
            { 'match' : {'user' : user}}
          ]
        }
      }
    };
    let searchResult = this.getSlugData(bodyData,user);
    return Promise.resolve(searchResult);
  }

  getSlugs(user) {
    let bodyData = {
      'query': {
        'bool' : {
          'must' : [
            { 'match' : {'user' : user}}
          ],
          'must_not': {
            'exists': {
              'field': 'site_id'
            }
          }
        }
      }
    };
    let searchResult = this.getSlugData(bodyData,user);
    return Promise.resolve(searchResult);
  }

  _setup(app, path) {
    var self = this;
    var username =  config.credOptions.username;
    app.post('/' + path + '/*/sites/:siteId/createCategory', async (req, res, err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let site_id = req.params.siteId;
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';

      let response = await self.createCategoryToES(username,req);
      res.send(response);
      // }
    });

    app.post('/' + path + '/*/createCategory',async (req, res,err) => {
      if(err) {
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let username =  config.credOptions.username
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';
      let response = await self.createCategoryToES(username,req);
      res.send(response);
    });

    app.get('/' + path + '/*/sites/:siteId', async (req, res,err) => {
      if(err) {
        console.log('Error :', err); // eslint-disable-line no-console
      }
      let site_id = req.params.siteId;
      // let username =  await self.check(req)
      // let user = username
      let response = await self.getBySiteId(site_id,username);
      res.send(response);
    });

    app.get('/' + path + '/*/sites', async (req, res,err) => {
      if(err) {
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let username =  await self.check(req)
      // let user = username
      let response = await self.getAllSites(username);
      res.send(response);
    });

    app.post('/' + path + '/*/sites',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let username =  await self.check(req)
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';
      let response = await self.createCategoryToES(username,req);
      res.send(response);
    });


    app.post('/' + path + '/*/sites/:siteId',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      req.body['site_id'] = req.params.siteId;
      // let username =  await self.check(req)
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';
      let response = await self.createCategoryToES(username,req);
      res.send(response);
    });

    app.get('/' + path + '/*/sites/:siteId/slugs/*',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      let site_id = req.params.siteId;
      // let username =  await self.check(req)
      let user = username;
      let response = await self.getAllSlugs(site_id,user);
      res.send(response);
    });

    app.get('/' + path + '/*/sites/slugs/*',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let username =  await self.check(req)
      // let user = username
      let response = await self.getSlugs(username);
      res.send(response);
    });

    app.post('/' + path + '/*/sites/slugs/*',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      // let username =  await self.check(req)
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';
      let response = await self.saveSlugToES(username,req);
      res.send(response);
    });

    app.post('/' + path + '/*/sites/:siteId/slugs/*',async (req,res,err) => {
      if(err){
        console.log('Error :', err); // eslint-disable-line no-console
      }
      req.body['site_id'] = req.params.siteId;
      // let username =  await self.check(req)
      req.body['user'] = username;
      req.body['vid'] = 'sup5-1';
      let response = await self.saveSlugToES(username,req);
      res.send(response);
    });
  }

  async getResultFromES(bodyData) {
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

  async getESResultbySite(bodyData,user) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = user;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    // let esOptions = this.options.esOption;
    let response = await esClient.search({
      index: 'categories',
      type: 'preferences',
      body: bodyData
    });
    return response;
  }

  async getSlugData(bodyData,user) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = user;
    let passWord = config.credOptions.password; // config.host
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    // let esOptions = this.options.esOption;
    let response = await esClient.search({
      index: 'categoryslug',
      type: 'slugAndHref',
      body: bodyData
    });
    return response;
  }

  createCategoryToES(username,req) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    var i = new Promise((resolve,reject) => { // eslint-disable-line no-unused-vars
      if(req.body.id != 'undefined'){
        let res = esClient.delete({
          index: 'categories',
          type: 'preferences',
          id: req.body.id
        });
        resolve(res);
        delete req.body['id'];
      }
    });
    let response = esClient.index({
      index: 'categories',
      type: 'preferences',
      body: req.body
    });
    return Promise.resolve(response);
  }

  saveSlugToES(username,req) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    var i = new Promise((resolve,reject)=>{ // eslint-disable-line no-unused-vars
      if(req.body.id != 'undefined'){
        let res = esClient.delete({
          index: 'categoryslug',
          type: 'slugAndHref',
          id: req.body.id
        });
        resolve(res);
        delete req.body['id'];
      }
    });

    let response = esClient.index({
      index: 'categoryslug',
      type: 'slugAndHref',
      body: req.body
    });
    return Promise.resolve(response);

  }

  saveByWebsite(username,req) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username;
    let passWord = config.credOptions.password;
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+':'+passWord
    });

    // let esOptions = this.options.esOption;

    var i = new Promise((resolve,reject) => { // eslint-disable-line no-unused-vars
      if(req.body.id != 'undefined'){
        let res = esClient.delete({
          index: 'categories',
          type: 'preferences',
          id: req.body.id
        });
        resolve(res);
        delete req.body['id'];
      }
    });

    let response = esClient.index({
      index: 'categories',
      type: 'preferences',
      body: req.body
    });
    return Promise.resolve(response);
  }

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
