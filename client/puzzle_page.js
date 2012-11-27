Template.puzzlePage.puzzleId = function () {
  return JigsawRouter.currentPuzzleId();
};

Template.puzzlePage.puzzle = function () {
  return Puzzles.findOne(JigsawRouter.currentPuzzleId());
};

Template.familiesList.allFamilies = function () {
  // XXX sort?
  return Families.find();
};

Template.familiesList.familyValue = function () {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'families', this._id);
};

Template.familiesList.maybeSelected = function () {
  // XXX RIGHT HERE NOW
};

Template.metadataList.allMetadata = function () {
  // XXX sort?
  return PuzzleMetadata.find();
};

Template.metadataList.metadataValue = function () {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'metadata', this._id);
};

var ESCAPE = 27;
var ENTER = 13;

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector] =
    function (evt, template) {
      if (evt.type === "keydown" && evt.which === ESCAPE) {
        // escape = cancel
        cancel.call(this, evt, template);
      } else if (evt.type === "keydown" && evt.which === ENTER) {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        ok.call(this, value, evt, template);
        // On IE10, without this, hitting enter will also click on some random
        // button.
        evt.preventDefault();
      }
    };
  return events;
};


// TAGS
var addTag = function (newTag, event, template) {
  if (!newTag)
    return;
  var puzzleId = JigsawRouter.currentPuzzleId();
  if (!puzzleId)
    return;
  Meteor.call('addTag', puzzleId, newTag);
  template.find('#addTag').value = '';
};
Template.puzzlePage.events({
  // TAGS
  'click .removeTag': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.call('removeTag', puzzleId, this);
  },
  'click #addTagButton': function (event, template) {
    var addTagInput = template.find('#addTag');
    if (!addTagInput)
      return;
    addTag(addTagInput.value || "", event, template);
  }
});
Template.puzzlePage.events(okCancelEvents(
  '#addTag', {
    ok: addTag,
    cancel: function () {
      reactivelyShow('tagEditor', false);
    }}));

// TITLE
Template.puzzlePage.events(okCancelEvents(
  '#setTitle', {
    ok: function (newTitle, event, template) {
      if (!newTitle)
        return;
      var puzzleId = JigsawRouter.currentPuzzleId();
      if (!puzzleId)
        return;
      Meteor.call('setTitle', puzzleId, newTitle);
      reactivelyShow('titleEditor', false);
    },
    cancel: function () {
      reactivelyShow('titleEditor', false);
    }}));

// METADATA
Template.puzzlePage.events(okCancelEvents(
  '.setMetadata', {
    ok: function (value) {
      var puzzleId = JigsawRouter.currentPuzzleId();
      if (!puzzleId)
        return;
      Meteor.call('setMetadata', puzzleId, this._id, value);
      reactivelyShow(this._id, false);
    },
    cancel: function () {
      reactivelyShow(this._id, false);
    }}));

