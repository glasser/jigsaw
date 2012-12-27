Template.searchPage.showing = function () {
  return JigsawRouter.showingSearch();
};

Template.searchPage.search = function () {
  return JigsawRouter.currentSearch();
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
