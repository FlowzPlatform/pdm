const assert = require('assert');
const app = require('../../src/app');

describe('\'pdm\' service', () => {
  it('registered the service', () => {
    const service = app.service('pdm');

    assert.ok(service, 'Registered the service');
  });
});
