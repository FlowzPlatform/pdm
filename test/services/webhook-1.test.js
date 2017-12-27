const assert = require('assert');
const app = require('../../src/app');

describe('\'webhook1\' service', () => {
  it('registered the service', () => {
    const service = app.service('webhook-1');

    assert.ok(service, 'Registered the service');
  });
});
