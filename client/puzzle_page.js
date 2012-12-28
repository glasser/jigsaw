Meteor.startup(function () {
  Meteor.autorun(function () {
    var puzzle = JigsawRouter.currentPuzzle();
    if (puzzle && puzzle.title)
      document.title = "Puzzle: " + puzzle.title;
  });
});

Template.puzzlePage.puzzleId = function () {
  return JigsawRouter.currentPuzzleId();
};

Template.puzzlePage.puzzle = function () {
  return JigsawRouter.currentPuzzle();
};

Template.familiesList.familyValue = function () {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'families', this._id);
};

Template.familiesList.maybeSelected = function (familyId) {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return (Meteor._get(puzzle, 'families', familyId) === this.toString()
          ? 'selected' : '');
};

Template.metadataList.metadataValue = function () {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'metadata', this._id);
};


// TAGS
var addTags = function (event, template, newTagsString) {
  if (!newTagsString)
    return;
  var puzzleId = JigsawRouter.currentPuzzleId();
  if (!puzzleId)
    return;
  Meteor.call('addTags', puzzleId, newTagsString);
  template.find('#addTags').value = '';
};
Template.puzzlePage.events({
  // TAGS
  'click .removeTag': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.call('removeTag', puzzleId, this);
  },
  'click #addTagsButton': function (event, template) {
    var addTagsInput = template.find('#addsTag');
    if (!addTagsInput)
      return;
    addTags(event, template, addTagsInput.value || "");
  }
});
Template.puzzlePage.events(okCancelEvents(
  '#addTags', {
    ok: addTags,
    cancel: function () {
      reactivelyShow('tagEditor', false);
    }}));

// TITLE
Template.puzzlePage.events(okCancelEvents(
  '#setTitle', {
    ok: function (event, template, newTitle) {
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
    ok: function (event, template, value) {
      var puzzleId = JigsawRouter.currentPuzzleId();
      if (!puzzleId)
        return;
      Meteor.call('setMetadata', puzzleId, this._id, value);
      reactivelyShow(this._id, false);
    },
    cancel: function () {
      reactivelyShow(this._id, false);
    }}));

// FAMILIES
Template.puzzlePage.events({
  'change .setFamily': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (!puzzleId)
      return;
    // Need to use DomUtils for IE8 support.
    Meteor.call('setFamily', puzzleId, this._id,
                DomUtils.getElementValue(event.target));
    reactivelyShow(this._id, false);
  }
});
