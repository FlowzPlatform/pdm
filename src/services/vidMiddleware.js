const errors = require('@feathersjs/errors');

exports.check = async function getUsername(serviceObject, vid, flag) { // flag : true, false 
  let user, password, error;                                                  // true if calling from hook.js
  if (vid) {                                                         // false if calling from custom route
    await serviceObject.get(vid)
      .then(response => {
        user = response.esUser;
        password = response.password;
      }).catch(err => {
        error = new errors.NotFound(err.message);
      });
  }
  if(flag && !vid) {
    throw new errors.Forbidden('Unauthorized access');
  } else if (!flag && !vid) {
    // Error will catch at req.params.credential[2] on other side as res.send(req.params.credential[2]) 
    return [user, password, new errors.Forbidden('Unauthorized access')];
  } else if (error instanceof Error) {
    return [user, password, error];
  } else {
    return [user, password];
  }
};