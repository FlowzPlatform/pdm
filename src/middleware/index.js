const handler = require('@feathersjs/express/errors');
const notFound = require('feathers-errors/not-found');
const subscription = require('flowz-subscription');
const flowzError = require('flowz-error-handler');

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  subscription.moduleResource.moduleName = 'vshopdata';
  let registerAppModule = {
    'vshopdata': ['create']
  };

  subscription.moduleResource.registerAppModule = registerAppModule;
  subscription.moduleResource.appRoles = ['admin', 'csr'];
  subscription.registeredAppModulesRole();
  subscription.registerDynamicHooks(app, registerAppModule);

  app.use(flowzError());
  app.use(notFound());
  app.use(handler());
};
