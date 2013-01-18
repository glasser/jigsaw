Jigsaw = {};

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
  addTags: function (puzzleId, newTagsString) {
    var newTagsArray = tagStringToArray(newTagsString);
    if (_.isEmpty(newTagsArray))
      return;
    Puzzles.update(puzzleId, {$addToSet: {tags: {$each: newTagsArray}}});
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
    var puzzle = Puzzles.findOne(puzzleId);
    if (!puzzle)
      return;
    // Pretty hacky, but it works.
    if (value === 'Solved') {
      var by = '';
      var user = Meteor.user();
      if (user && user.username && user.username !== 'nobody')
        by = ' by ' + _.escape(user.username);
      createNewsfeed(puzzleLink(puzzleId, puzzle.title) + ' solved' + by + '!');
    }
    Puzzles.update(puzzleId, {$set: set});
  },
  createPuzzle: function (title, tags, families, metadata) {
    var puzzle = {title: title};
    if (tags && !_.isEmpty(tags))
      puzzle.tags = tags;
    if (families && !_.isEmpty(families))
      puzzle.families = families;
    if (metadata && !_.isEmpty(metadata))
      puzzle.metadata = metadata;
    var puzzleId = Puzzles.insert(puzzle);
    createNewsfeed('New puzzle ' + puzzleLink(puzzleId, puzzle.title) + '!');
    return puzzleId;
  },
  createBanner: function (content) {
    Banners.insert({content: content, created: (+new Date)});
  },
  createHeaderLink: function (text, href) {
    HeaderLinks.insert({text: text, href: href, created: (+new Date)});
  },
  createComment: function (puzzleId, text) {
    return createComment(puzzleId, text);
  },
  editComment: function (commentId, text) {
    if (this.isSimulation)
      return;
    if (!LocalCollection._selectorIsId(commentId))
      return;
    Comments.update(commentId, {$set: {text: text, updated: +(new Date)}});
  },
  setPriority: function (commentId, priority) {
    if (!_.contains(COMMENT_PRIORITIES, priority))
      throw new Meteor.Error(500, "Unknown priority " + priority);
    Comments.update(commentId, {$set: {priority: priority}});
  },
  createUpload: function (puzzleId, filepicker) {
    return createUpload(puzzleId, filepicker);
  }
});
