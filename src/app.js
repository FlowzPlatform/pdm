const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const configuration = require('@feathersjs/configuration');
const rest = require('@feathersjs/express/rest');


const jwt = require('@feathersjs/authentication-jwt');
const auth = require('@feathersjs/authentication');
const config = require('../config/default.json');

if (process.env.esUrl != '')
    config.esUrl = process.env.esUrl
if(process.env.secret != '')
    config.secret = process.env.secret
if(process.env.auth_url != '')
    config.auth_url = process.env.auth_url
if(process.env.pwd != '')
    config.pwd = process.env.pwd


const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const rethinkdb = require('./rethinkdb');

const app = express(feathers());
// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

app.configure(rethinkdb);
app.configure(rest());
app.configure(auth({ secret: config.secret }));
app.configure(jwt({service : "categories"}));
app.configure(jwt({service : "api/products"}));
app.configure(jwt({service : "filters"}));
//



// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);


module.exports = app;
