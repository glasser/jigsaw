(function(){
Template.addPuzzleDialog.showing = function () {
  return Session.get('dialog.addPuzzle');
};
Template.addPuzzleDialog.error = function () {
  return Session.get('dialog.addPuzzle.error');
};

var createPuzzle = function (evt, template) {
  var title = template.find('input.title');
  if (!title || !title.value) {
    Session.set('dialog.addPuzzle.error', 'Enter a title');
    if (title) {
      Meteor.flush();
      title.focus();
    }
    return;
  }
  title = title.value;

  var tags = template.find('input.tags');
  if (tags)
    tags = tagStringToArray(tags.value);

  var families = {};
  _.each(template.findAll('select.family'), function (select) {
    var id = select.getAttribute('data-id');
    var value = DomUtils.getElementValue(select);
    if (id && value)
      families[id] = value;
  });

  var metadata = {};
  _.each(template.findAll('input.metadata'), function (input) {
    var id = input.getAttribute('data-id');
    var value = input.value;
    if (id && value)
      metadata[id] = value;
  });

  Meteor.call(
    'createPuzzle', title, tags, families, metadata, function (err, puzzleId) {
      if (err) {
        Session.set('dialog.addPuzzle.error', err);
      } else {
        Session.set('dialog.addPuzzle', false);
        JigsawRouter.navigateToPuzzle(puzzleId);
      }
    });
};

var closeDialog = function () {
  Session.set('dialog.addPuzzle', false);
};

Template.addPuzzleDialog.events({
  'click .cancel': closeDialog,
  'click .save': createPuzzle
});

Template.addPuzzleDialog.events(okCancelEvents(
  '', {ok: createPuzzle, cancel: closeDialog}));

})();
