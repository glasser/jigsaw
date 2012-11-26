Handlebars.registerHelper("show", function (options) {
  if (reactivelyShowing(options.hash.section)) {
    return options.fn(this) + Template.reactiveHideLink({
      section: options.hash.section,
      hideIcon: options.hash.hideIcon || 'ban-circle'
    });
  }
  var hidden = '';
  if (options.inverse) {
    hidden = options.inverse(this);
  }
  return hidden + Template.reactiveShowLink({
    section: options.hash.section,
    useEditButton: options.hash.useEditButton,
    linkText: options.hash.linkText || '[show]'});
});

// for use with #if
Handlebars.registerHelper("showing", function (section) {
  return reactivelyShowing(section);
});

var reactivelyShow = function (section, show) {
  Session.set('reactiveShow.' + section, !!show);
  if (show) {
    Meteor.flush();
    var focusElement = DomUtils.find(document, '.focus-' + section);
    if (focusElement)
      focusElement.focus();
  }
};

var reactivelyShowing = function (section) {
  return !! Session.get('reactiveShow.' + section);
};

Template.reactiveShowLink.events({
  'click .reactiveShow': function (event, template) {
    reactivelyShow(template.data.section, true);
  }
});
Template.reactiveHideLink.events({
  'click .reactiveHide': function (event, template) {
    reactivelyShow(template.data.section, false);
  }
});
