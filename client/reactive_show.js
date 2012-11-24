Handlebars.registerHelper("show", function (options) {
  if (reactivelyShowing(options.hash.section)) {
    return options.fn(this) + Template.reactiveHideLink({
      section: options.hash.section});
  }
  return Template.reactiveShowLink({
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
