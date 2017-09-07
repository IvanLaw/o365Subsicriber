var AzureOAuth2Strategy  = require("passport-azure-oauth2");
var jwt 				  = require("jwt-simple");
var config 				  = require("./config.json");

function AzureOAuthStrategy() {
	this.passport = require("passport");
	
	this.passport.use("provider", new AzureOAuth2Strategy({
	  clientID: config.clientID,
	  clientSecret: config.clientSecret,
	  callbackURL: config.callbackUri,
	  resource: config.resource,
	  tenant: config.tenant,
	  prompt: 'login',
	  state: false
	},
	function (accessToken, refreshtoken, params, profile, done) {
		var user = jwt.decode(params.id_token, "", true);
		user.accessToken = accessToken;
	  done(null, user);
	}));

	this.passport.serializeUser(function(user, done) {
		console.log("serializeUser", user.upn);
		done(null, user);
	});

	this.passport.deserializeUser(function(user, done) {
		console.log("deserializeUser", user.upn);
		done(null, user);
	});
}

module.exports = new AzureOAuthStrategy();