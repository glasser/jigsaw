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
    Accounts.callLoginMethod({
      methodArguments: [{justUsername: username}],
      userCallback: callback
    });
  };

  var login = function (template) {
    var username = template.find('#username-other').value ||
          template.find('#directory').value;
    if (username) {
      Jigsaw.loginAsUser(username, function (err) {
        // XXX deal with err
        reactivelyShow('userDirectory', false);
      });
    }
  };

  Meteor.autorun(function () {
    // If you ever become logged out, show the user directory.
    if (!Meteor.userId())
      reactivelyShow('userDirectory', true);
  });

  Template.userPanel.users = function () {
    return Meteor.users.find({}, {sort: ['username']});
  };
  Template.userPanel.current = function () {
    return Meteor.user() && this.username === Meteor.user().username;
  };
  Template.userPanel.events({
    'click #show-change-username': function () {
      reactivelyShow('userDirectory', true);
    },
    'keydown #username-other': function (event, template) {
      if (event.which === 13)
        login(template);
    },
    'click #change-username': function (event, template) {
      login(template);
    }
  });
}
