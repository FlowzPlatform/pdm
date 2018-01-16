const product = require('./product/product.service.js');
const subscribeToWebHooks = require('./subscribe-to-web-hooks/subscribe-to-web-hooks.service.js');
const filters = require('./filters/filters.service.js');
const categories = require('./categories/categories.service.js');
const vshopdata = require('./vshopdata/vshopdata.service.js');
const vshopList = require('./vshop-list/vshop-list.service.js');
const pdm = require('./pdm/pdm.service.js');
const vshopDetail = require('./vshop-detail/vshop-detail.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(product);
  app.configure(subscribeToWebHooks);
  app.configure(filters);
  app.configure(categories);
  app.configure(vshopdata);
  app.configure(vshopList);
  app.configure(pdm);
  app.configure(vshopDetail);
};
