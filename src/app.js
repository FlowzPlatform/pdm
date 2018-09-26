const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const express = require('@feathersjs/express');

const configuration = require('@feathersjs/configuration');
const rest = require('@feathersjs/express/rest');
// const socketio = require('@feathersjs/socketio');
const feathers = require('@feathersjs/feathers');
const subscription = require('flowz-subscription');

const socketio = require('socket.io');
// var app = require("express")();
const r = require('rethinkdb');

const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const config = require('./config.js');
let conn = config.rethinkdb; // eslint-disable-line no-unused-vars

if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl;
if(process.env.secret != '')
  config.secret = process.env.secret;
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url;
if(process.env.pwd != '')
  config.pwd = process.env.pwd;
if(process.env.domainKey != '')
  config.domainKey = process.env.domainKey;
if(process.env.index != '')
  config.credOptions.index = process.env.index;
if (process.env.wsport != '') 
  config.wsPort = process.env.wsport;
  
const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const rethinkdb = require('./rethinkdb');
  
const app = express(feathers());
// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));

// Enable CORS, security, compression, favicon and body parsing
app.use(function(req, res, next) {
  this.app = app;
  this.apiHeaders = req.headers ;
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));
app.configure(rethinkdb);
app.configure(rest());
// app.configure(socketio());
// app.configure(socketio(config.wsPort, {
//   wsEngine: 'uws',
//   origin: '*.localhost:*'
// }));
var rethink = { 'db': config.rethinkdb.db, 'host': config.rethinkdb.servers[0].host, 'port': config.rethinkdb.servers[0].port };
var io = socketio.listen(app.listen(4038), {log: false,  wsEngine: 'uws', origin: '*.' + config.domainKey + ':*'});

console.log('socketio listening on port 4038'); // eslint-disable-line no-console
 
r.connect(rethink).then(function(conn) {
  return r.table('vshopdata').changes().run(conn);
})
  .then(function(cursor) {
    cursor.each(function(err, data) {
      io.sockets.emit('update', data);
    });
  });

app.configure(authentication({ secret: config.secret }));
app.configure(jwt({service : 'vshop-detail'}));

app.use(subscription.featherSubscription);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
