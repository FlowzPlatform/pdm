const assert = require('assert');
const app = require('../../src/app');

describe('\'vshopList\' service', () => {
  it('registered the service', () => {
    const service = app.service('vshop-list');

    assert.ok(service, 'Registered the service');
  });
});
