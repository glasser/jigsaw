var currentPuzzleFamilyValue = function (familyName) {
  var puzzle = JigsawRouter.currentPuzzle();
  if (!puzzle)
    return null;
  var family = Families.findOne({name: familyName});
  if (!family)
    return '';
  return Meteor._get(puzzle, 'families', family._id);
};


Meteor.startup(function () {
  Meteor.autorun(function () {
    var puzzle = JigsawRouter.currentPuzzle();
    if (puzzle && puzzle.title)
      document.title = "Puzzle: " + puzzle.title;
    if (currentPuzzleFamilyValue('Status') === 'Solved')
      document.body.className = 'status-solved';
    else
      document.body.className = '';
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
Template.comments.helpers({
  'comments': function () {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (!puzzleId)
      return null;
    // priorities are in alphabetical order of uselessness.
    return Comments.find({puzzleId: puzzleId},
                         {sort: {priority: 1, created: -1}});
  },
  maybeSelected: function (commentId) {
    var comment = Comments.findOne(commentId);
    if (!comment)
      return '';
    return comment.priority === this.toString() ? 'selected' : '';
  },
  priorities: function () {
    return COMMENT_PRIORITIES;
  },
  editing: function () {
    return Meteor.user().username !== 'nobody' &&
      Session.get('commentEditor.show.' + this._id);
  },
  originalText: function () {
    return Session.get('commentEditor.text.' + this._id);
  },
  originalVersion: function () {
    return Session.get('commentEditor.version.' + this._id);
  }
});


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
  },
  'click .editComment': function () {
    Session.set('commentEditor.show.' + this._id, true);
    // Use the session to set the default textarea text, so it gets preserved.
    Session.set('commentEditor.text.' + this._id, this.text);
    Session.set('commentEditor.version.' + this._id, this.version);
  },
  'click .cancelEditComment': function () {
    Session.set('commentEditor.show.' + this._id, false);
  },
  'click .saveEditComment': function (event, template) {
    var context = this;
    var textarea = template.find('#edit-comment-text-' + context._id);
    if (!textarea)
      return;
    var text = normalizeCommentText(textarea.value);
    if (text === null)
      return;

    if (text === context.text) {
      Session.set('commentEditor.show.' + context._id, false);
      return;
    }

    // Send in the "theirs" version, even if it's not what our text is based on.
    Meteor.call('editComment', context._id, context.version, text, function (err, result) {
      if (err)
        throw err;
      if (result)
        Session.set('commentEditor.show.' + context._id, false);
    });
  },
  'click .mergeComment': function (event, template) {
    event.preventDefault();
    var textarea = template.find('#edit-comment-text-' + this._id);
    if (!textarea)
      return;
    var baseText = Session.get('commentEditor.text.' + this._id);
    if (!baseText)
      return;
    var yourText = normalizeCommentText(textarea.value);
    if (yourText === null)
      return;
    var theirText = this.text;
    if (!theirText)
      return;
    var merged = merge3(theirText, baseText, yourText);
    if (merged === null)
      return;

    // Yay, we merged it. Update both the "base" and "yours" to the merged
    // version, and consider ourselves to be based on the current version (so
    // the merge prompt goes away).
    textarea.value = merged;
    Session.set('commentEditor.text.' + this._id, merged);
    Session.set('commentEditor.version.' + this._id, this.version);
  }
});

var merge3 = function (theirText, baseText, yourText) {
  var theirLines = theirText.split('\n');
  var baseLines = baseText.split('\n');
  var yourLines = yourText.split('\n');
  // inspired by demo_diff3_dig_in
  var lines = [];
  _.each(Diff.diff3_merge(theirLines, baseLines, yourLines, false), function (item) {
    if (item.ok) {
      Array.prototype.push.apply(lines, item.ok);
    } else {
      _.each(Diff.diff_comm(item.conflict.a, item.conflict.b), function (inner) {
        if (inner.common) {
          Array.prototype.push.apply(lines, inner.common);
        } else {
          lines.push("<<<<<<<<<");
          Array.prototype.push.apply(lines, inner.file1);
          lines.push("=========");
          Array.prototype.push.apply(lines, inner.file2);
          lines.push(">>>>>>>>>");
        }
      });
    }
  });
  return normalizeCommentText(lines.join('\n'));
};


// UPLOADS
Template.uploads.uploads = function () {
  var puzzleId = JigsawRouter.currentPuzzleId();
  if (!puzzleId)
    return null;
  return Uploads.find({puzzleId: puzzleId}, {sort: {created: -1}});
};

Template.uploads.bucket = function () {
  return UPLOAD_CONFIG.s3bucket;
};

Template.uploads.events({
  'click #upload-button': function () {
    filepicker.pickAndStore({multiple: true}, {location: 'S3'}, function (fpfiles) {
      _.each(fpfiles, function (fpfile) {
        Meteor.call('createUpload', JigsawRouter.currentPuzzleId(), fpfile);
      });
    });
  }
});
