var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var helmet = require('helmet');// use telmet to improve security

var index = require('./routes/index');
var users = require('./routes/users');
var auth  	= require("./auth");
var session = require("express-session");
var passport = require('passport');


// // ******************************
// var fs = require('fs');
// var path = require('path');
// var util = require('util');
// var assert = require('assert-plus');
// var bunyan = require('bunyan');
// var getopt = require('posix-getopt');
// var mongoose = require('mongoose/');
// var restify = require('restify');


// var BearerStrategy = require('passport-azure-ad').BearerStrategy;
// var config = require('./config');

// var options = {
//     // The URL of the metadata document for your app. We will put the keys for token validation from the URL found in the jwks_uri tag of the in the metadata.
//     identityMetadata: config.creds.identityMetadata,
//     clientID: config.creds.clientID,
//     validateIssuer: config.creds.validateIssuer,
//     audience: config.creds.audience,
//     passReqToCallback: config.creds.passReqToCallback,
//     loggingLevel: config.creds.loggingLevel

// };

// // Array to hold logged in users and the current logged in user (owner).
// var users = [];
// var owner = null;

// // Our logger.
// var log = bunyan.createLogger({
//     name: 'Azure Active Directory Bearer Sample',
//          streams: [
//         {
//             stream: process.stderr,
//             level: "error",
//             name: "error"
//         },
//         {
//             stream: process.stdout,
//             level: "warn",
//             name: "console"
//         }, ]
// });

//   // If the logging level is specified, switch to it.
//   if (config.creds.loggingLevel) { log.levels("console", config.creds.loggingLevel); }

// // MongoDB setup.
// // Set up some configuration.
// var serverPort = process.env.PORT || 8080;
// var serverURI = (process.env.PORT) ? config.creds.mongoose_auth_mongohq : config.creds.mongoose_auth_local;

// // Connect to MongoDB.
// global.db = mongoose.connect(serverURI);
// var Schema = mongoose.Schema;
// log.info('MongoDB Schema loaded');

// // Here we create a schema to store our tasks and users. It's a fairly simple schema for now.
// var TaskSchema = new Schema({
//     owner: String,
//     task: String,
//     completed: Boolean,
//     date: Date
// });

// // Use the schema to register a model.
// mongoose.model('Task', TaskSchema);
// var Task = mongoose.model('Task');

// // ******************************

// passport.use(new AzureAdOAuth2Strategy({
//   clientID: '{d467efb1-1d11-49ba-8bc0-d36c25e69ac6}',
//   clientSecret: '{fge1faQ+teA0U+J1b0dMso3KKniNUEOonZ8fennqtvo=}',
//   callbackURL: 'http://localhost:3000/callback',
//   resource: 'https://manage.office.com',
//   tenant: 'd42ae020-d9b6-4a72-94b1-c445ad93445f'
// },
// function (accessToken, refresh_token, params, profile, done) {
//   var waadProfile = profile || jwt.decode(params.id_token, '', true);
 
//   User.findOrCreate({ id: waadProfile.upn }, function (err, user) {
//     done(err, user);
//   });
// }));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//
app.use( session({ 
    secret: 'somesecret', 
    resave: true, 
    saveUninitialized : true 
}));
app.use(auth.passport.initialize());
app.use(auth.passport.session());
//

app.use('/', index);


// use telmet to improve security
app.use(helmet());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
var port = process.env.port || 3000;
app.listen(port);