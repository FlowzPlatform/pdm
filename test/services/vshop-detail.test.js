const assert = require('assert');
const app = require('../../src/app');

describe('\'vshopDetail\' service', () => {
  it('registered the service', () => {
    const service = app.service('vshop-detail');

    assert.ok(service, 'Registered the service');
  });
});
