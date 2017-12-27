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

  find (params) {
    let bodyData ={
        "size": 0,
       "aggs": {
              "group_by_category" : {
                "terms": {
                  "field": "categories.raw",
                  "size": 1000
                }
              }
            }
      }
      let searchResult = this.getResultFromES(bodyData,params)
      return Promise.resolve(searchResult)
  }

        async getBySiteId (site_id, user) {
          console.log("*******",site_id,user)
          let bodyData = {
            "query": {
                "bool" : {
                        "must" : [
                           { "match" : {"site_id" : site_id}},
                          { "match" : {"user" : user}}
                        ]
                      }}
        }
        let searchResult = this.getESResultbySite(bodyData,user)
        return Promise.resolve(searchResult)
      }

      async getByCategoryId (category_id,user) {
        console.log("*******",category_id,user)
        let bodyData = {
          "query": {
              "bool" : {
                      "must" : [
                         { "match" : {"category_list.id" : category_id}},
                        { "match" : {"user" : user}}
                      ]
                    }}
      }
      let searchResult = this.getESResultbySite(bodyData,user)
      return Promise.resolve(searchResult)
    }


      async getAllSites(user) {
        let bodyData = {
            "query": {
                "bool" : {
                        "must" : [
                          { "match" : {"user" : user}}
                        ],
                        "must_not": {
                      "exists": {
                          "field": "site_id"
                      }
                  }
                      }}
        }
      let searchResult = this.getESResultbySite(bodyData,user)
      return Promise.resolve(searchResult)
      }

      async getAllSlugs(site_id,user) {
        console.log("!!!!!!!!getallslugs",site_id,user)
        let bodyData = {
          "query": {
              "bool" : {
                      "must" : [
                         { "match" : {"site_id" : site_id}},
                        { "match" : {"user" : user}}
                      ]
                    }}
      }
      let searchResult = this.getSlugData(bodyData,user)
      return Promise.resolve(searchResult)
      }

      async getSlugs(user) {
        console.log("!!!!!!!!getslugs",user)
        let bodyData = {
            "query": {
                "bool" : {
                        "must" : [
                          { "match" : {"user" : user}}
                        ],
                        "must_not": {
                      "exists": {
                          "field": "site_id"
                      }
                  }
                      }}
        }
      let searchResult = this.getSlugData(bodyData,user)
      return Promise.resolve(searchResult)
      }

      _setup(app, path) {
        var self = this;
        app.post('/' + path + '/*/sites/:siteId/createCategory',async function (req, res,err) {
          if(err){
            console.log(err)
          }
          let site_id = req.params.siteId
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.createCategoryToES(username,req)
          res.send(response)
        });

        app.post('/' + path + '/*/createCategory',async function (req, res,err) {
          if(err){
            console.log(err)
          }
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.createCategoryToES(username,req)
          console.log("_____________",response);
          res.send(response)
        });

        app.get('/' + path + '/*/sites/:siteId', async function (req, res,err) {
          if(err){
            console.log(err)
          }
          let site_id = req.params.siteId
          let username =  await self.check(req)
          let user = username
          let response = await self.getBySiteId(site_id,user);
          res.send(response)
        });

        app.get('/' + path + '/*/sites', async function (req, res,err) {
          if(err){
            console.log(err)
          }
          let username =  await self.check(req)
          let user = username
          let response = await self.getAllSites(user);
          res.send(response)
        });

        app.post('/' + path + '/*/sites',async function (req,res,err) {
          console.log("########")
          if(err){
            console.log(err)
          }
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.createCategoryToES(username,req)
          console.log("__________",response)
          res.send(response)
        });


        app.post('/' + path + '/*/sites/:siteId',async function (req,res,err) {
          if(err){
            console.log(err)
          }
          req.body["site_id"] = req.params.siteId
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.createCategoryToES(username,req)
          console.log("__________",response)
          res.send(response)
        });

        app.get('/' + path + '/*/sites/:siteId/slugs/*',async function (req,res,err) {
          console.log("%%%%%%%%%")
          if(err){
            console.log(err)
          }
          let site_id = req.params.siteId
          let username =  await self.check(req)
          let user = username
          let response = await self.getAllSlugs(site_id,user);
          res.send(response)
        });

        app.get('/' + path + '/*/sites/slugs/*',async function (req,res,err) {
          console.log("%%%%%%%%%")
          if(err){
            console.log(err)
          }
          let username =  await self.check(req)
          let user = username
          let response = await self.getSlugs(user);
          res.send(response)
        });

        app.post('/' + path + '/*/sites/slugs/*',async function (req,res,err) {
          console.log("@@@@@@@@@@@@")
          if(err){
            console.log(err)
          }
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.saveSlugToES(username,req)
          console.log("__________",response)
          res.send(response)
        });

        app.post('/' + path + '/*/sites/:siteId/slugs/*',async function (req,res,err) {
          console.log("@@@@@@@@@@@@")
          if(err){
            console.log(err)
          }
          req.body["site_id"] = req.params.siteId
          let username =  await self.check(req)
          req.body["user"] = username
          req.body["vid"] = "sup5-1"
          let response = await self.saveSlugToES(username,req)
          console.log("__________",response)
          res.send(response)
        });

      }

      async check (req) {

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


  async getResultFromES(bodyData,params) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = params.username
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

  async getESResultbySite(bodyData,user) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = user
    let passWord = config.pwd
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+":"+passWord
    })

    let esOptions = this.options.esOption
    let response = await esClient.search({
      index: 'categories',
      type: 'preferences',
      body: bodyData
    })
    return response
  }

  async getSlugData(bodyData,user) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = user
    let passWord = config.host
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+":"+passWord
    })

    let esOptions = this.options.esOption
    let response = await esClient.search({
      index: 'categoryslug',
      type: 'slugAndHref',
      body: bodyData
    })
    return response
  }

  createCategoryToES(username,req) {
   let elasticsearch = this.options.elasticsearch;
   let host = this.options.esUrl;
   let userName = username
   let passWord = config.pwd
   const esClient = new elasticsearch.Client({
     host: host,
     httpAuth:userName+":"+passWord
   })

   var i = new Promise((resolve,reject)=>{
   if(req.body.id != 'undefined'){
     let res = esClient.delete({
       index: 'categories',
       type: 'preferences',
       id: req.body.id
     })
       resolve(res)
       delete req.body['id']
     }
 })
   // console.log("++++++++++save category called")
   // console.log("****************",req.body)
   let response = esClient.index({
     index: 'categories',
     type: 'preferences',
     body: req.body
   })
   return Promise.resolve(response)

 }

 saveSlugToES(username,req) {
  let elasticsearch = this.options.elasticsearch;
  let host = this.options.esUrl;
  let userName = username
  let passWord = config.pwd
  const esClient = new elasticsearch.Client({
    host: host,
    httpAuth:userName+":"+passWord
  })

  var i = new Promise((resolve,reject)=>{
  if(req.body.id != 'undefined'){
    let res = esClient.delete({
      index: 'categoryslug',
      type: 'slugAndHref',
      id: req.body.id
    })
      resolve(res)
      delete req.body['id']
    }
})

  let response = esClient.index({
    index: 'categoryslug',
    type: 'slugAndHref',
    body: req.body
  })
  return Promise.resolve(response)

}

  saveByWebsite(username,req) {
    let elasticsearch = this.options.elasticsearch;
    let host = this.options.esUrl;
    let userName = username
    let passWord = config.pwd
    const esClient = new elasticsearch.Client({
      host: host,
      httpAuth:userName+":"+passWord
    })

    let esOptions = this.options.esOption

    var i = new Promise((resolve,reject)=>{
    if(req.body.id != 'undefined'){
      let res = esClient.delete({
        index: 'categories',
        type: 'preferences',
        id: req.body.id
      })
        resolve(res)
        delete req.body['id']
      }
  })

    let response = esClient.index({
      index: 'categories',
      type: 'preferences',
      body: req.body
    })
    return Promise.resolve(response)
  }

}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
