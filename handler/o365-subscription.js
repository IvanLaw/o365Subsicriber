var request = require("request");
var url = require('url');
const { URLSearchParams } = require('url');
var jwt = require("jwt-simple");
var MongoClient = require('mongodb').MongoClient;
var config = require("../config.json");


var root = "https://manage.office.com/api/v1.0/" + config.tenant + "/activity/feed/subscriptions/";

function service(contentType) {
    var serviceType = {};
    if (contentType != null) {
        serviceType.contentType = contentType;
    }
    serviceType.PublisherIdentifier = config.clientID;
    return new URLSearchParams(serviceType);
}

function start(req, res) {
    var actionUrl = root + "start" + "?";
    actionUrl = actionUrl + service(req.serviceType).toString();
    console.log(actionUrl);
    var bodyObj = {
        "webhook": {
            "address": config.webhookCB,
            "authId": "o365activityapinotification",
            "expiration": ""
        }
    };
    console.log(bodyObj);
    request.post(actionUrl, { headers: { 'content-type': 'application/json; utf-8' }, 'auth': { 'bearer': req.user.accessToken }, body: JSON.stringify(bodyObj)}, function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        subscriptionsRender(res,JSON.parse(body));
    });
};

function stop(req, res, subscriptionsRender) {
    var actionUrl = root + "stop" + "?";
    actionUrl = actionUrl + service(req.serviceType).toString();
    console.log(actionUrl);
    request.post(actionUrl, { 'auth': { 'bearer': req.user.accessToken } }, function (error, response, body) {
        subscriptionsRender(res,JSON.parse(body));
    });
};

function list(req, res, subscriptionsRender) {
    var actionUrl = root + "list" + "?";
    actionUrl = actionUrl + service(null).toString();
    console.log(actionUrl);
    request.get(actionUrl, { 'auth': { 'bearer': req.user.accessToken } }, function (error, response, body) {
        subscriptionsRender(res,JSON.parse(body));
    });
};

function list_content(req, res, subscriptionsRender) {
    var actionUrl = root + "content" + "?";
    actionUrl = actionUrl + service(req.serviceType).toString();
    console.log(actionUrl);
    request.get(actionUrl, { 'auth': { 'bearer': req.user.accessToken } }, function (error, response, body) {
        subscriptionsRender(res,JSON.parse(body));
    });
};

function list_notifications(req, res, subscriptionsRender) {
    var actionUrl = root + "notifications" + "?";
    actionUrl = actionUrl + service(req.serviceType).toString();
    console.log(actionUrl);
    request.get(actionUrl, { 'auth': { 'bearer': req.user.accessToken } }, function (error, response, body) {
        subscriptionsRender(res,JSON.parse(body));
    });
};

function retrieveContent(req, res) {
    var url = 'https://login.windows.net/' + config.tenant + '/oauth2/token';
    var bodyObj = {
        'grant_type':'client_credentials',
        'client_id':config.clientID,
        'client_secret':config.clientSecret,
        'resource':config.resource
    };
    var bodyStr = (new URLSearchParams(bodyObj)).toString();
    request.post(url, { headers: { 'content-type': 'application/x-www-form-urlencoded;' }, body: bodyStr }, function (error, response, body) {
        var access_token = JSON.parse(body).access_token;
        if (req.body != null && req.body.length > 0 && access_token) {
            req.body.forEach(function (item) {
                if (null != item.contentUri) {
                    request.get(item.contentUri, { 'auth': { 'bearer': access_token } }, function (error, response, body) {
                        console.log(error);
                        console.log(body);
                        MongoClient.connect(config.dbUrl, function (err, db) {
                            try {
                                db.collection('content').insertMany(JSON.parse(body));
                            } catch (e) {
                                //..
                            }
                            db.close();
                        });
                    });
                }
            });
        }
    });
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

module.exports = {
    start: start,
    stop: stop,
    list: list,
    list_content:list_content,
    list_notifications:list_notifications,
    retrieveContent:retrieveContent
};