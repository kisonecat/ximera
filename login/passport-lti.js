var util = require("util"),
  passport = require("passport"),
  _ = require("underscore"),
  mdb = require("../mdb"),
  lti = require("ims-lti"),
  config = require("../config"),
  url = require("url");

function LtiStrategy(options, verify) {
  this.name = "lti";
  this._verify = verify;
  this.returnURL = options.returnURL;
  passport.Strategy.call(this, options, verify);
}

util.inherits(LtiStrategy, passport.Strategy);

LtiStrategy.prototype.authenticate = function (req) {
  // I'm behind nginx so it looks like I'm serving http, but as far as the rest of the world is concerned, it's https
  var protocol = "https";
  if (req.get("host") == "localhost:" + config.port) {
    protocol = "http";
  }

  var myRequest = _.extend({}, req, { protocol: protocol });
  myRequest.originalUrl = config.toValidPath(myRequest.originalUrl);
  var self = this;

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    self.success(user, info);
  }

  var profile = req.body;

  mdb.KeyAndSecret.findOne(
    { ltiKey: profile.oauth_consumer_key },
    function (err, keyAndSecret) {
      if (err) self.error(err);
      else {
        if (!keyAndSecret) {
          self.error("The LTI key has not been registered with xake lti");
        } else {
          self.provider = new lti.Provider(
            keyAndSecret.ltiKey,
            keyAndSecret.ltiSecret
          );

          self.provider.valid_request(myRequest, function (err, isValid) {
            if (!isValid) {
              return self.error(err);
            } else {
              // An LTI user may end up taking a course multiple times, but we want a fresh experience each time
              var identifier = profile.user_id + "-" + profile.context_id;
              self._verify(req, identifier, profile, verified);
            }
          });
        }
      }
    }
  );
};

module.exports.Strategy = LtiStrategy;
