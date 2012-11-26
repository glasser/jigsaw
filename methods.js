Meteor.methods({
  removeTag: function (puzzleId, tag) {
    Puzzles.update(puzzleId, {$pull: {tags: tag}});
  },
  addTag: function (puzzleId, tag) {
    Puzzles.update(puzzleId, {$addToSet: {tags: tag}});
  }
});