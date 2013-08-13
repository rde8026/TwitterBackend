/**
 * Created with IntelliJ IDEA.
 * User: reldridge1
 * Date: 8/13/13
 * Time: 10:36 AM
 */

var db = require('../db/database')
    , gcm = require('node-gcm');

var projectId = "379401999507";

exports.update = function(req, res) {
    try {
        var registrationIds = [];
        var twitterId, messageId, deviceId;
        twitterId = req.body.twitterId;
        messageId = req.body.messageId;
        deviceId = req.body.deviceId;

        db.updateUserMessageId(messageId, twitterId, function(err, bool) {
            if (err) {
                console.error("Unable to update status message to our datastore");
                console.error(err);
            } else {
                console.info("Updated messageId for user - beginning push notification process");
                db.userDevices(twitterId, function(err, devices) {
                    if (err) {
                        throw new Error("Unable to get devices for user: " + twitterId);
                    } else {
                        devices.forEach(function(val) {
                            if (deviceId != val.deviceId) {
                                console.log("Sending update message to device: " + val.deviceId + " last message read was " + messageId);
                                registrationIds.push(val.deviceId);
                            }
                        });

                        if (registrationIds.length > 0) {
                            var message = new gcm.Message({
                                collapseKey : "statusUpdate"
                                , delayWhileIde : true
                                , timeToLive : 3
                                , data : {
                                    key1 : messageId
                                }
                            });
                            var sender = new gcm.Sender(projectId);
                            sender.send(message, registrationIds, 3, function(err, result) {
                                if (err) {
                                    res.send(500, {error : err});
                                } else {
                                    console.info("Result from GCM Send: " + result.messageId);
                                    res.send(200, {messageId : result.messageId});
                                }
                            });
                        } else {
                            console.info("No other devices configured to receive updates - not sending @ " + new Date());
                            res.send(200);
                        }
                    }
                });

            }
        });

    } catch (err) {
        console.error(err);
        res.send(500, {error : err});
    }
};

