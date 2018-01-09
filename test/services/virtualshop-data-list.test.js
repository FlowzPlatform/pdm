const assert = require('assert');
const app = require('../../src/app');

describe('\'virtualshopDataList\' service', () => {
  it('registered the service', () => {
    const service = app.service('virtualshop-data-list');

    assert.ok(service, 'Registered the service');
  });
});
