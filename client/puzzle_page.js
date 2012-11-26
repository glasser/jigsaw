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

Template.puzzlePage.events({
  'click .removeTag': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.call('removeTag', puzzleId, this);
  },
  'keyup #addTag, click #addTagButton': function (event, template) {
    if (event.type === 'keyup' && event.which !== 13)
      return;
    var newTag = template.find('#addTag').value;
    if (!newTag)
      return;
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (!puzzleId)
      return;
    Meteor.call('addTag', puzzleId, newTag);
    event.target.value = '';
  }
});

