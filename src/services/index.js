const product = require('./product/product.service.js');
const subscribeToWebHooks = require('./subscribe-to-web-hooks/subscribe-to-web-hooks.service.js');
const webhook1 = require('./webhook-1/webhook-1.service.js');
const webhook2 = require('./webhook-2/webhook-2.service.js');
const filters = require('./filters/filters.service.js');
const categories = require('./categories/categories.service.js');
const pdm = require('./pdm/pdm.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(product);
  app.configure(subscribeToWebHooks);
  app.configure(webhook1);
  app.configure(webhook2);
  app.configure(filters);
  app.configure(categories);
  app.configure(pdm);
};
