Jigsaw.methods = function (methods) {
  if (Meteor.isClient) {
    Meteor.methods(methods);
    return;
  }

  // On the server, we need to prevent all (user-defined) methods from doing
  // anything unless you are logged in.
  var wrappedMethods = {};
  _.each(methods, function (body, name) {
    wrappedMethods[name] = function () {
      if (!this.userId)
        throw new Meteor.Error(401, "Must be logged in");
      return body.apply(this, arguments);
    };
  });
  Meteor.methods(wrappedMethods);
};

Jigsaw.methods({
  removeTag: function (puzzleId, tag) {
    Puzzles.update(puzzleId, {$pull: {tags: tag}});
  },
  addTag: function (puzzleId, tag) {
    Puzzles.update(puzzleId, {$addToSet: {tags: tag}});
  },
  setTitle: function (puzzleId, newTitle) {
    Puzzles.update(puzzleId, {$set: {title: newTitle}});
  },
  setMetadata: function (puzzleId, metadataId, value) {
    var key = "metadata." + metadataId;
    var set = {};
    set[key] = value;
    Puzzles.update(puzzleId, {$set: set});
  },
  setFamily: function (puzzleId, familyId, value) {
    var key = "families." + familyId;
    var set = {};
    set[key] = value;
    Puzzles.update(puzzleId, {$set: set});
  }
});
