const assert = require('assert');
const app = require('../../src/app');

describe('\'vshopdata\' service', () => {
  it('registered the service', () => {
    const service = app.service('vshopdata');

    assert.ok(service, 'Registered the service');
  });
});
