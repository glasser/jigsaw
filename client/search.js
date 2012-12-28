Meteor.startup(function () {
  Meteor.autorun(function () {
    if (JigsawRouter.showingSearch()) {
      document.title = "Puzzles " + Template.searchPage.searchDescription();
    }
  });
});


var eachQueryPiece = function (queryUrl, f) {
  var pieces = (queryUrl || '').split('/');

  _.each(pieces, function (piece) {
    if (piece.length === 0)
      return;
    var equalsLocation = piece.indexOf('=');
    var command, arg;
    if (equalsLocation === -1) {
      command = 'tag';
      arg = piece;
    } else {
      command = piece.substr(0, equalsLocation);
      arg = piece.substr(equalsLocation + 1);
    }
    f(command, arg);
  });
};

var queryUrlToSelector = function (queryUrl) {
  var selector = {};
  eachQueryPiece(queryUrl, function (command, arg) {
    if (command === 'tag') {
      if (!selector.tags)
        selector.tags = {$all: []};
      selector.tags.$all.push(arg);
      return;
    }
    var family = Families.findOne({name: command});
    if (family) {
      selector['families.' + family._id] = arg;
      return;
    }
    // XXX other cases?
  });
  return selector;
};

var queryUrlToDescription = function (queryUrl) {
  var description = [];
  eachQueryPiece(queryUrl, function (command, arg) {
    if (command === 'tag') {
      description.push(arg);
      return;
    }
    var family = Families.findOne({name: command});
    if (family) {
      description.push(command + ': ' + arg);
    }
  });

  return _.map(description, function (x) { return '[' + x + ']'; }).join(' ');
};

Template.searchPage.showing = function () {
  return JigsawRouter.showingSearch();
};

Template.searchPage.search = function () {
  return Puzzles.find(queryUrlToSelector(JigsawRouter.currentSearchQueryUrl()));
};

Template.searchPage.searchDescription = function () {
  return queryUrlToDescription(JigsawRouter.currentSearchQueryUrl());
};

Template.searchPage.allFamilies = function () {
  // Want to sort in some consistent order; maybe should actually define a sort
  // key or something later.
  return Families.find({}, {sort: ['name']});
};

// 'this' is a Families object
Template.searchPage.familyValue = function (puzzleId) {
  var puzzle = Puzzles.findOne(puzzleId);
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'families', this._id);
};
