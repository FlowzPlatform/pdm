

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => console.log('before find hook 1 ran'),
      hook => lookback(hook),
      hook => console.log('before find hook 2 ran')
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [hook => console.log('after find hook 1 ran'),
    // hook => lookback(hook),
    hook => console.log('after find hook 2 ran')],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

function lookback (hook) {
  for (var i = 0; i < 10000; i++) {
    //console.log('===I Loop==', i)
    for (var j = 0; j < 1000; j++) {
      //console.log('===J Loop==', j)
      for (var k = 0; k < 1000; k++) {
        //console.log('===k Loop==', k)
      }
    }
  }
}
