Jigsaw = {};

if (Meteor.isServer) {
  Meteor.publish("directory", function () {
    return Meteor.users.find({}, {username: 1});
  });

  Accounts.registerLoginHandler(function (options) {
    if (!options.justUsername)
      return undefined;  // don't handle
    var user = Meteor.users.findOne({username: options.justUsername});
    if (user) {
      var stampedLoginToken = Accounts._generateStampedLoginToken();
      Meteor.users.update(
        user._id, {$push: {'services.resume.loginTokens': stampedLoginToken}});

      return {token: stampedLoginToken.token, id: user._id};
    } else {
      user = {username: options.justUsername};
      return Accounts.insertUserDoc({generateLoginToken: true}, user);
    }
  });
} else {
  Meteor.subscribe("directory");

  Jigsaw.loginAsUser = function (username, callback) {
    Meteor.apply('login', [{justUsername: username}], {wait: true},
                 function (error, result) {
                   if (error || !result) {
                     error = error || new Error("No result from call to login");
                     callback && callback(error);
                     return;
                   }

                   Accounts._makeClientLoggedIn(result.id, result.token);
                   callback && callback();
                 });
  };

  Template.hello.users = function () {
    return Meteor.users.find();
  };
  Template.hello.events({
    'click .directory li': function (e) {
      Jigsaw.loginAsUser(this.username);
    },
    'click #logout': function (e) {
      Meteor.logout();
    }
  });
}
