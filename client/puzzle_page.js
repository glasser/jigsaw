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
Template.tagList.events({
  // TAGS
  'click .removeTag': function (event, template) {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.call('removeTag', puzzleId, this);
  },
  'click #addTagsButton': function (event, template) {
    var addTagsInput = template.find('#addTags');
    if (!addTagsInput)
      return;
    addTags(event, template, addTagsInput.value || "");
  }
});
Template.tagList.events(okCancelEvents(
  '#addTags', {
    ok: addTags,
    cancel: function () {
      reactivelyShow('tagEditor', false);
    }}));

// TITLE
Template.puzzleTitle.events(okCancelEvents(
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
Template.metadataList.events(okCancelEvents(
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

// SPREADSHEETS
Template.spreadsheets.events(addButtonEvents(
  '#addSpreadsheet', '#addSpreadsheetButton',
  function (event, template, titlePiece, addSpreadsheetInput) {
    var puzzle = JigsawRouter.currentPuzzle();
    if (!puzzle)
      return;
    var title = titlePiece ? (titlePiece + ' [' + puzzle.title + ']')
          : puzzle.title;
    if (!addSpreadsheetInput)
      return;
    var addSpreadsheetButton = template.find('#addSpreadsheetButton');
    if (!addSpreadsheetButton)
      return;
    addSpreadsheetInput.value = '';
    addSpreadsheetInput.disabled = true;
    addSpreadsheetButton.disabled = true;
    Meteor.call('createSpreadsheet', puzzle._id, title, function (err, result) {
      if (err) {
        alert(err);
      }
      addSpreadsheetInput.disabled = false;
      addSpreadsheetButton.disabled = false;
    });
  }));


// Hack to make the spreadsheets template auto-refresh every 30 seconds.
var spreadsheetRefreshSet = new Meteor.deps._ContextSet;
Meteor.setInterval(function () {
  spreadsheetRefreshSet.invalidateAll();
}, 30*1000);
Template.spreadsheets.autoRefresh = function () {
  spreadsheetRefreshSet.addCurrentContext();
};


// COMMENTS
Template.comments.comments = function () {
  var puzzleId = JigsawRouter.currentPuzzleId();
  if (!puzzleId)
    return null;
  // priorities are in alphabetical order of uselessness.
  return Comments.find({puzzleId: puzzleId},
                       {sort: {priority: 1, created: -1}});
};

Template.comments.maybeSelected = function (commentId) {
  var comment = Comments.findOne(commentId);
  if (!comment)
    return '';
  return comment.priority === this.toString() ? 'selected' : '';
};

Template.comments.priorities = function () {
  return COMMENT_PRIORITIES;
};

Template.comments.events({
  'click #add-comment-button': function (event, template) {
    var textarea = template.find('#add-comment-text');
    if (!textarea)
      return;
    var text = textarea.value;
    Meteor.call('createComment', JigsawRouter.currentPuzzleId(), text, function (err, result) {
      if (err)
        throw err;
      if (result)
        textarea.value = '';
    });
  },
  'change .setPriority': function (event, template) {
    var commentId = this._id;
    if (!commentId)
      return;
    Meteor.call('setPriority', commentId,
                DomUtils.getElementValue(event.target));
    reactivelyShow(this._id, false);
  }
});
