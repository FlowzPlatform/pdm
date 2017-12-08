const assert = require('assert');
const app = require('../../src/app');

describe('\'webhook2\' service', () => {
  it('registered the service', () => {
    const service = app.service('webhook-2');

    assert.ok(service, 'Registered the service');
  });
});
