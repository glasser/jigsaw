Meteor.startup(function () {
  Meteor.autorun(function () {
    if (JigsawRouter.showingSearch()) {
      document.title = "Puzzles " + Template.searchPage.searchDescription();
    }
  });
});

var getMetaOrFamilyKey = function (name) {
  var meta = PuzzleMetadata.findOne({name: name});
  if (meta) {
    return 'metadata.' + meta._id;
  }
  var family = Families.findOne({name: name});
  if (family) {
    return 'families.' + family._id;
  }
  return null;
};

var eachQueryPiece = function (queryUrl, f) {
  var pieces = (queryUrl || '').split('/');

  var foundDeleted = false;

  _.each(pieces, function (piece) {
    if (piece.length === 0)
      return;
    var negate = false;
    if (piece.substr(0, 1) === '-') {
      negate = true;
      piece = piece.substr(1);
    }
    var equalsLocation = piece.indexOf('=');
    var command, arg;
    if (equalsLocation === -1) {
      command = 'tag';
      arg = piece;
    } else {
      command = piece.substr(0, equalsLocation);
      arg = piece.substr(equalsLocation + 1);
    }

    if (command === 'tag' && arg === 'deleted')
      foundDeleted = true;
    f(command, arg, negate);
  });

  // If the query doesn't explicitly ask for deleted puzzles, we filter them
  // out.
  if (!foundDeleted)
    f('tag', 'deleted', true);
};

var queryUrlToQuery = function (queryUrl) {
  var selector = {};
  var sort = [];
  eachQueryPiece(queryUrl, function (command, arg, negate) {
    if (command === 'tag') {
      if (!selector.tags)
        selector.tags = {};
      var subSelector = negate ? '$nin' : '$all';
      if (!selector.tags[subSelector])
        selector.tags[subSelector] = [];
      selector.tags[subSelector].push(arg);
      return;
    } else if (command === 'sort') {
      var sortKey = getMetaOrFamilyKey(arg);
      if (sortKey) {
        sort.push([sortKey, negate ? 'desc' : 'asc']);
      }
      return;
    }
    var family = Families.findOne({name: command});
    if (family) {
      var familyKey = 'families.' + family._id;
      if (negate) {
        // Positive searches override negatives.
        if (selector[familyKey] && selector[familyKey].$in)
          return;
        if (!selector[familyKey])
          selector[familyKey] = {$nin: []};
        selector[familyKey].$nin.push(arg);
      } else {
        // Positive searches override negatives.
        if (!selector[familyKey] || selector[familyKey].$nin)
          selector[familyKey] = {$in: []};
        selector[familyKey].$in.push(arg);
        return;
      }
    }
    // XXX other cases?
  });
  var options = {};
  if (!_.isEmpty(sort))
    options.sort = sort;
  return {
    selector: selector,
    options: options
  };
};

var queryUrlToDescription = function (queryUrl) {
  var description = [];
  var sort = [];
  eachQueryPiece(queryUrl, function (command, arg, negate) {
    if (command === 'tag') {
      description.push((negate ? 'not ' : '') + arg);
      return;
    } else if (command === 'sort') {
      if (getMetaOrFamilyKey(arg))
        sort.push('by ' + arg + (negate ? ' descending' : ''));
    }
    var family = Families.findOne({name: command});
    if (family) {
      description.push(command + (negate ? ' ≠ ' : ' = ') + arg);
    }
  });

  return _.map(description.concat(sort),
               function (x) { return '[' + x + ']'; }).join(' ');
};

Template.searchPage.showing = function () {
  return JigsawRouter.showingSearch();
};

Template.searchPage.search = function () {
  var query = queryUrlToQuery(JigsawRouter.currentSearchQueryUrl());
  return Puzzles.find(query.selector, query.options);
};

Template.searchPage.searchDescription = function () {
  return queryUrlToDescription(JigsawRouter.currentSearchQueryUrl());
};

// 'this' is a Families object
Template.searchPage.familyValue = function (puzzleId) {
  var puzzle = Puzzles.findOne(puzzleId);
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'families', this._id);
};

// 'this' is a PuzzleMetadata object
Template.searchPage.metadataValue = function (puzzleId) {
  var puzzle = Puzzles.findOne(puzzleId);
  if (!puzzle)
    return '';
  return Meteor._get(puzzle, 'metadata', this._id);
};
