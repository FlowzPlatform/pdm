const assert = require('assert');
const app = require('../../src/app');

describe('\'SubscribeToWebHooks\' service', () => {
  it('registered the service', () => {
    const service = app.service('subscribe-to-web-hooks');

    assert.ok(service, 'Registered the service');
  });
});
