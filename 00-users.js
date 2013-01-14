if (Meteor.isServer) {
  // Publish no data unless you're logged in.
  Jigsaw.publish = function (name, f) {
    Meteor.publish(name, function () {
      if (this.userId) {
        return f.apply(this, arguments);
      } else {
        this.complete();
        return null;
      }
    });
  };

  Jigsaw.publish("directory", function () {
    return Meteor.users.find({}, {username: 1});
  });

  var logInAsUsername = function (username) {
    var user = Meteor.users.findOne({username: username});
    if (user) {
      var stampedLoginToken = Accounts._generateStampedLoginToken();
      Meteor.users.update(
        user._id, {$push: {'services.resume.loginTokens': stampedLoginToken}});

      return {token: stampedLoginToken.token, id: user._id};
    } else {
      user = {username: username};
      return Accounts.insertUserDoc({generateLoginToken: true}, user);
    }
  };

  Accounts.registerLoginHandler(function (options) {
    if (!options.changeUsername)
      return undefined;  // don't handle

    // This can only be used to CHANGE user, not log in initially.
    if (!Meteor.userId())
      throw new Meteor.Error('Not already logged in!');

    return logInAsUsername(options.changeUsername);
  });

  Accounts.registerLoginHandler(function (options) {
    if (!options.globalPassword)
      return undefined;

    // This is just used for initial login, not changing username.
    if (Meteor.userId())
      throw new Meteor.Error('Already logged in!');

    if (options.globalPassword !== (Meteor.settings.globalPassword || 'secret'))
      throw new Meteor.Error('Wrong password!');
    return logInAsUsername('nobody');
  });
} else {
  Meteor.subscribe("directory");

  Jigsaw.changeUsername = function (username, callback) {
    Accounts.callLoginMethod({
      methodArguments: [{changeUsername: username}],
      userCallback: callback
    });
  };

  Jigsaw.logInWithGlobalPassword = function (password, callback) {
    Accounts.callLoginMethod({
      methodArguments: [{globalPassword: password}],
      userCallback: callback
    });
  };

  var changeUsername = function (template) {
    var username = template.find('#username-other').value ||
          DomUtils.getElementValue(template.find('#directory'));
    if (username) {
      Jigsaw.changeUsername(username, function (err) {
        // XXX deal with err
        reactivelyShow('userDirectory', false);
      });
    }
  };

  Meteor.autorun(function () {
    // If logged in as nobody, always show the directory.
    if (Meteor.user() && Meteor.user().username === 'nobody')
      reactivelyShow('userDirectory', true);
  });

  Template.userPanel.users = function () {
    return Meteor.users.find({}, {sort: ['username']});
  };
  Template.userPanel.current = function () {
    return Meteor.user() && this.username === Meteor.user().username;
  };
  Handlebars.registerHelper("isNobody", function () {
    return Meteor.user().username === 'nobody';
  });
  Template.userPanel.events({
    'click #show-change-username': function () {
      reactivelyShow('userDirectory', true);
    },
    'keydown #username-other': function (event, template) {
      if (event.which === 13)
        changeUsername(template);
    },
    'click #change-username': function (event, template) {
      changeUsername(template);
    }
  });

  Template.passwordForm.events({
    'keydown #globalPassword': function (event, template) {
      if (event.which === 13)
        Jigsaw.logInWithGlobalPassword(event.target.value);
    }
  });
}
