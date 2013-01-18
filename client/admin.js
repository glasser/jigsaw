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

Template.adminHeaderLinks.events(okCancelEvents(
  '.addLink', {
    ok: function (event, template) {
      var textInput = template.find('#addLinkText');
      var hrefInput = template.find('#addLinkHref');
      if (!textInput || !hrefInput || !textInput.value || !hrefInput.value)
        return;
      Meteor.call('createHeaderLink', textInput.value, hrefInput.value);
      textInput.value = hrefInput.value = '';
    }}));

Template.adminHeaderLinks.events({
  'click .removeHeaderLink': function () {
    HeaderLinks.remove(this._id);
  }
});


Template.adminPuzzleMetadata.helpers({
  'urlChecked': function () {
    return this.url ? 'checked' : '';
  },
  'showInSearchChecked': function () {
    return this.showInSearch ? 'checked' : '';
  }
});

Template.adminPuzzleMetadata.events(addButtonEvents(
  '#addPuzzleMetadata', '#addPuzzleMetadataButton', function (event, template, contents, input) {
    if (contents)
      PuzzleMetadata.insert({name: contents});
    if (input)
      input.value = '';
  }));

Template.adminPuzzleMetadata.events({
  'change .puzzleMetadataUrlCheckbox': function (event) {
    PuzzleMetadata.update(this._id, {$set: {url: event.currentTarget.checked}});
  },
  'change .puzzleMetadataShowInSearchCheckbox': function (event) {
    PuzzleMetadata.update(this._id,
                          {$set: {showInSearch: event.currentTarget.checked}});
  }
});

Template.adminFamilies.events({
  'click .removeDefault': function (event) {
    event.preventDefault();
    Families.update(this._id, {$unset: {default: 1}});
  },
  'click .setFamilyDefault': function (event) {
    event.preventDefault();
    var id = event.currentTarget.getAttribute('data-id');
    if (!id)
      return;
    Families.update(id, {$set: {default: this.toString()}});
  },
  'click .removeFamilyValue': function (event) {
    event.preventDefault();
    var id = event.currentTarget.getAttribute('data-id');
    if (!id)
      return;
    debugger;
    Families.update(id, {$pull: {values: this.toString()}});
  }
});

Template.adminFamilies.events(okCancelEvents(
  '.addFamilyValue', {
    ok: function (event, template, value, input) {
      if (!value)
        return;
      Families.update(this._id, {$addToSet: {values: value}});
      input.value = '';  // input has id so will be preserved (and focused!)
    }}));
