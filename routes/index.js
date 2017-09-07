var express = require('express');
var router = express.Router();
var auth = require("../auth");
var jwt = require("jwt-simple");
var request = require("request");
var config = require("../config.json");
var subscription = require("./../handler/o365-subscription");
var MongoClient = require('mongodb').MongoClient;


router.get('/', function (req, res, next) {
    res.render('index', { title: 'OIA365' });
});

router.get('/subscriptions', function (req, res) {
    if(null == req.user) {
        var error={};
        error.status = 'Unauthorized';
        error.stack = '......';
        res.render('error', { message:"Error", error: error });
    }  
    res.render('subscriptions', { contentTypes: ["Audit.AzureActiveDirectory","Audit.Exchange","Audit.SharePoint","Audit.General","DLP.All"]});    
});

router.get('/test', function (req,res,next) {
    req.body = [{contentUri:'https://manage.office.com/api/v1.0/d42ae020-d9b6-4a72-94b1-c445ad93445f/activity/feed/audit/20170818023443351015161$20170818023443351015161$audit_sharepoint$Audit_SharePoint$IsFromNotification'},{contentUri:'https://manage.office.com/api/v1.0/d42ae020-d9b6-4a72-94b1-c445ad93445f/activity/feed/audit/20170818023429625014182$20170818023429625014182$audit_sharepoint$Audit_SharePoint$IsFromNotification'}];
    subscription.retrieveContent(req,res);
    console.log('test');
});

router.get('/permissions', function (req,res,next) {
    console.log(req);
    res.send('req');
});

router.post('/subscriptions', function (req, res) {
    console.log(req.body);
    if(null == req.user) {
        var error={};
        error.status = 'Unauthorized';
        error.stack = '......';
        res.render('error', { message:"Error", error: error });
    }   
    req.serviceType = req.body['contentType'];
    if('start' == req.body['action']) {
        subscription.start(req, res, subscriptionsRender);
    } else if ('stop' == req.body['action']) {
        subscription.stop(req, res, subscriptionsRender);
    } else if ('list' == req.body['action']) {
        subscription.list(req, res, subscriptionsRender);
    } else if ('list_content' == req.body['action']) {
        subscription.list_content(req, res, subscriptionsRender);
    } else {
        subscription.list_notifications(req, res, subscriptionsRender);
    }
    
});

var subscriptionsRender = function(res, msg){
    res.render('subscriptions', { contentTypes: ["Audit.AzureActiveDirectory","Audit.Exchange","Audit.SharePoint","Audit.General","DLP.All"], msg:msg});
}
router.post("/login", auth.passport.authenticate("provider", { successRedirect: "/" }), function (req, res) {
    res.send("login");
});

router.get("/callback", auth.passport.authenticate("provider", { failureRedirect: "/login" }), function (req, res) {
    res.redirect("/subscriptions");
});

// save json to mongoDB
// router.all('/webhook', function (req, res, next) {
//     MongoClient.connect(config.dbUrl, function (err, db) {
//         try {
//             db.collection('testing').insertMany(req.body);
//         } catch (e) {
//             res.send(e);
//         }
//         db.close();
//     });
//     subscription.retrieveContent(req, res);
//     res.sendStatus(200);
// });

// Data save json to csv
router.all('/webhook', function (req, res, next) {
    MongoClient.connect(config.dbUrl, function (err, db) {
        try {
            db.collection('testing').insertMany(req.body);
        } catch (e) {
            res.send(e);
        }
        db.close();
    });
    subscription.retrieveContent(req, res);
    res.sendStatus(200);
});

module.exports = router;
