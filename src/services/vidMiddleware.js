const errors = require('@feathersjs/errors');
let cachedVid = {};

exports.check = async function getUsername(serviceObject, vid, flag) { // eslint-disable-line
  let user, password, error, cacheKey;                                // flag : true, false true; if calling from hook.js
  if (vid) {                                                         // false if calling from custom route
    cacheKey = vid;
    if (cachedVid[cacheKey]) {
      return cachedVid[cacheKey];
    } else {
      await serviceObject.get(vid)
        .then(response => {
          user = response.esUser;
          password = response.password;
        }).catch(err => {
          error = new errors.NotFound(err.message);
        });
    }
  } else {
    throw new errors.Forbidden('Unauthorized access');
  }
  // if(!vid) {
  // } else if (!flag && !vid) {
  // Error will catch at req.params.credential[2] on other side as res.send(req.params.credential[2]) 
  // return [user, password, new errors.Forbidden('Unauthorized access')];
  // } else 
  if (error instanceof Error) {
    throw error;
    // return [user, password, error];
  } else {
    return cachedVid[cacheKey] = [user, password];
    // return [user, password];
  }
};