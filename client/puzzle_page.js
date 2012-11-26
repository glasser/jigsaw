// XXX should be a better place to put this. eg, a body rendered callback.
Template.puzzlePage.rendered = function () {
  reactiveShowRendered(this);
};

Template.puzzlePage.puzzleId = function () {
  return JigsawRouter.currentPuzzleId();
};

Template.puzzlePage.puzzle = function () {
  return Puzzles.findOne(JigsawRouter.currentPuzzleId());
};

Template.puzzlePage.allMetadata = function () {
  // XXX sort?
  return PuzzleMetadata.find();
};

Template.puzzlePage.metadataValue = function () {
  //  XXX _get top level
  var puzzle = Template.puzzlePage.puzzle();
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'metadata', this._id);
};

var ESCAPE = 27;
var ENTER = 13;

// This runs the given f if the type is *NOT* type, or if the which *IS*
// which.
var filterEvent = function (type, which, f) {
  return function (event, template) {
    if (event.type !== type || event.which === which)
      f.call(this, event, template);
  };
};

var escapeKeyDown = function (f) {
  return filterEvent('keydown', ESCAPE, f);
};

var enterKeyUp = function (f) {
  return filterEvent('keyup', ENTER, f);
};

Template.puzzlePage.events({
  'click .removeTag': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.call('removeTag', puzzleId, this);
  },
  'keyup #addTag, click #addTagButton': enterKeyUp(
    function (event, template) {
      var newTag = template.find('#addTag').value;
      if (!newTag)
        return;
      var puzzleId = JigsawRouter.currentPuzzleId();
      if (!puzzleId)
        return;
      Meteor.call('addTag', puzzleId, newTag);
      event.target.value = '';
    }),
  'keyup #setTitle': enterKeyUp(function (event, template) {
    var newTitle = template.find('#setTitle').value;
    if (!newTitle)
      return;
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (!puzzleId)
      return;
    Meteor.call('setTitle', puzzleId, newTitle);
    reactivelyShow('titleEditor', false);
  }),
  'keydown #setTitle': escapeKeyDown(function () {
    reactivelyShow('titleEditor', false);
  })
});

