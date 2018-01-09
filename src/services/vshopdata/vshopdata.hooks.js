
module.exports = {
  before: {
    all: [],
    find: [
    //hook => beforeFind(hook)
    ],
    get: [
      hook => before(hook)
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [
      //hook => after(hook)
    ],
    create: [],
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


function before(hook){
  return hook.app.service('vshopdata').find({
    query: { userId: hook.id }
  }).then(page => {
    hook.result = page.data;
    return hook;
  });
}

