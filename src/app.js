const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const jwt = require('@feathersjs/authentication-jwt');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio')

const auth = require('feathers-authentication');
const config = require('../config/default.json');

if (process.env.esUrl != '')
  config.esUrl = process.env.esUrl
if(process.env.secret != '')
  config.secret = process.env.secret
if(process.env.auth_url != '')
  config.auth_url = process.env.auth_url
if(process.env.pwd != '')
  config.pwd = process.env.pwd
if(process.env.domainkey != '')
  config.domainKey = process.env.domainkey
if(process.env.index != '')
  config.credOptions.index = process.env.index


const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const rethinkdb = require('./rethinkdb');

const app = feathers();
// Load app configuration
app.configure(configuration(path.join(__dirname, '..')))

// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
app.configure(hooks());
app.configure(rethinkdb);
app.configure(rest());
app.configure(auth({ secret: config.secret }));
app.configure(jwt({service : "categories"}));
app.configure(jwt({service : "api/products"}));
app.configure(jwt({service : "filters"}));
app.configure(jwt({service : "pdm"}));

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

app.configure(socketio({
    wsEngine: 'uws',
    origin: '*.' + config.domainKey + ':*'
  }));


module.exports = app;
