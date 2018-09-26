const assert = require('assert');
const app = require('../../src/app');

describe('\'promostandard-auth\' service', () => {
  it('registered the service', () => {
    const service = app.service('promostandard-auth');

    assert.ok(service, 'Registered the service');
  });
});
