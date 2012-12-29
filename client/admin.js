Meteor.startup(function () {
  Meteor.autorun(function () {
    if (JigsawRouter.showingAdmin()) {
      document.title = "Jigsaw Admin";
    }
  });
});

Template.adminPage.showing = function () {
  return JigsawRouter.showingAdmin();
};

Template.adminBanners.events({
  'click .removeBanner': function () {
    Banners.remove(this._id);
  }
});

Template.adminBanners.events(addButtonEvents(
  '#addBanner', '#addBannerButton', function (event, template, contents, input) {
    if (contents)
      Meteor.call('createBanner', contents);
    if (input)
      input.value = '';
  }));
