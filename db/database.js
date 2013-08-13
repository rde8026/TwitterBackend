/**
 * Copyright (c) Ryan Eldridge. All rights reserved.
 * Created by: ryaneldridge @ 8/12/13 8:24 PM
 *
 */

var Sequelize = require('sequelize-sqlite').sequelize
     , sqlite    = require('sequelize-sqlite').sqlite
     , devices, users, messages;

var sequelize = new Sequelize('', '', '', {
     dialect: 'sqlite',
     storage: './database.sqlite'
});

exports.init = function(cb) {
     try {
          users = sequelize.define('users', {
               id : { type : Sequelize.INTEGER, autoIncrement : true, primaryKey : true, allowNull : false }
               , twitterId : { type : Sequelize.STRING, allowNull : false }
          });

          devices = sequelize.define('devices', {
               id : { type : Sequelize.INTEGER, autoIncrement : true, primaryKey : true, allowNull : false }
               , deviceId : { type : Sequelize.STRING, allowNull : false }
              , registrationId : { type : Sequelize.STRING, allowNull : false }
          });

          messages = sequelize.define('messages', {
              id : { type : Sequelize.INTEGER, autoIncrement : true, primaryKey : true, allowNull : false }
              , messageId : { type : Sequelize.STRING, allowNull : false }
          });

          users.hasMany(devices, {onDelete : 'cascade'});
          users.hasOne(messages, {onDelete : 'cascade'});

          sequelize.sync()
               .success(function() {
                    cb(true);
               })
               .error(function(err) {
                    console.log(err);
                    cb(false);
               });
     } catch (err) {
          console.log(err);
          cb(false);
     }
};

exports.findOrCreateUser = function(userId, callback) {
     try {
          users.findOrCreate({twitterId : userId}).complete(function(err, user) {
               if (err) {
                    callback(err, null);
               } else {
                    callback(null, user);
               }
          });
     } catch (err) {
          console.log(err);
          callback(err, null);
     }
};

exports.addDeviceToUser = function(user, deviceId, registrationId, callback) {
     try {
          devices.build({deviceId : deviceId, registrationId : registrationId}).save()
               .complete(function(err, dev) {
                    if (err) {
                         callback(err, null);
                    } else {
                         user.addDevice(dev).complete(function(err, created) {
                              if (err) {
                                   callback(err, null);
                              } else {
                                   loadUserResponse(user, callback);
                              }
                         });
                    }
               });
     } catch (err) {
          console.log(err);
          callback(err, null);
     }
};

exports.userDevices = function(twitterId, callback) {
    try {
        users.find({
            where : {twitterId : twitterId}
            , include : [devices]
        }).complete(function(err, u) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, u.devices);
                }
            });
    } catch (err) {
        console.error(err);
        callback(err, null);
    }
};

exports.updateUserMessageId = function(messageId, twitterId, callback) {
    try {
        users.find({
            where : {twitterId : twitterId}
            , include : [messages]
        }).complete(function(err, user) {
            if (err) {
                callback(err, null);
            } else {
                if (user.message) {
                    var m = user.message;
                    m.messageId = messageId;
                    m.save().complete(function(err, updated) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, true);
                        }
                    });
                } else {
                    messages.build({messageId : messageId}).save()
                        .complete(function(err, created) {
                            user.setMessage(created).complete(function(err, msg) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, true);
                                }
                            });
                        });
                }
            }
        });
    } catch (err) {
        console.error(err);
        callback(err, null);
    }
};

function loadUserResponse(user, callback) {
     users.find({
               where : {id : user.id}
               , include : [ devices ]
     }).complete(function(err, u) {
          if (err) {
               callback(err, null);
          } else {
               callback(null, u);
          }
     });
}
