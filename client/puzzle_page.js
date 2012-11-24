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
    if (puzzleId) {
      // XXX relies on insecure
      Puzzles.update(puzzleId, {$pull: {tags: this}});
    }
  },
  'keyup #addTag': function (event, template) {
    if (event.which !== 13)
      return;
    var newTag = event.target.value;
    if (!newTag)
      return;
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (!puzzleId)
      return;
    // XXX relies on insecure
    Puzzles.update(puzzleId, {$addToSet: {tags: newTag}});
    event.target.value = '';
  }
});

