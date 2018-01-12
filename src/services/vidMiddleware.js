const errors = require('@feathersjs/errors');

exports.check = async function getUsername(serviceObject, vid, flag) { // flag : true, false 
  let user, password                                                  // true if calling from hook.js
  if (vid) {                                                         // false if calling from custom route
    await serviceObject.get(vid)
    .then(response => {
      user = response.esUser
      password = response.password
    }).catch(err => {
      throw err
    })
  }
  if(flag && !vid) {
    throw new errors.Forbidden('Unauthorized access')
  } else if (!flag && !vid){
    // Error will catch at req.params.credential[2] on other side as res.send(req.params.credential[2]) 
    return [user, password, new errors.Forbidden('Unauthorized access')]
  } else {
    return [user, password]
  }
}