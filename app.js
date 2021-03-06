
/**
 * Module dependencies.
 */

var express = require('express')
    , registration = require('./routes/register')
    , status = require('./routes/status')
    , db = require('./db/database')
    , http = require('http')
    , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8085);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/api/register/device', registration.registerDevice);
app.post('/api/status/update', status.update);
app.get('/api/status/ping', status.ping);

db.init(function(bool) {
     if (bool) {
          http.createServer(app).listen(app.get('port'), function(){
               console.log('Express server listening on port ' + app.get('port'));
          });
     } else {
          console.log("Unable to start up server");
     }
});

