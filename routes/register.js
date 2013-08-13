/**
 * Copyright (c) Ryan Eldridge. All rights reserved.
 * Created by: ryaneldridge @ 8/9/13 5:40 AM
 *
 */

var db = require('../db/database');

exports.registerDevice = function(req, res) {

     /*console.log('***** Registering Device *******');
     console.log(req.body.deviceId);
     console.log(req.body.twitterId);*/

     db.findOrCreateUser(req.body.twitterId, function(err, user) {
          if (err) {
               res.send("Error: " + err);
          } else {
               db.addDeviceToUser(user, req.body.deviceId, function(err, created) {
                    if (err) {
                         res.send("Error: " + err);
                    } else {
                         res.json(created);
                    }
               });
          }
     });

};