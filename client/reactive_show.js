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

var lastShown = null;

var reactivelyShow = function (section, show) {
  Session.set('reactiveShow.' + section, !!show);
  lastShown = section;
};

var reactivelyShowing = function (section) {
  return !! Session.get('reactiveShow.' + section);
};

var reactiveShowRendered = function (template) {
  if (!lastShown)
    return;
  var focusElement = template.find('.focus-' + lastShown);
  if (focusElement)
    focusElement.focus();
  lastShown = null;
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
