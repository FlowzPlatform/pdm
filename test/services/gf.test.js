const assert = require('assert');
const app = require('../../src/app');

describe('\'gf\' service', () => {
  it('registered the service', () => {
    const service = app.service('gf');

    assert.ok(service, 'Registered the service');
  });
});
