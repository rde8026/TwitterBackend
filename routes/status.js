/**
 * Created with IntelliJ IDEA.
 * User: reldridge1
 * Date: 8/13/13
 * Time: 10:36 AM
 */

var db = require('../db/database')
    , gcm = require('node-gcm');

exports.update = function(req, res) {
    try {
        var twitterId, messageId, deviceId;
        twitterId = req.body.twitterId;
        messageId = req.body.messageId;
        deviceId = req.body.deviceId;

        db.userDevices(twitterId, function(err, devices) {
            if (err) {
                throw new Error("Unable to get devices for user: " + twitterId);
            } else {
                devices.forEach(function(val) {
                    if (deviceId != val.deviceId) {
                        console.log("Sending update message to device: " + val.deviceId + " last message read was " + messageId);
                    }
                });
                res.send(200);
            }
        });

    } catch (err) {
        console.error(err);
        res.send(500, {error : err});
    }
};

