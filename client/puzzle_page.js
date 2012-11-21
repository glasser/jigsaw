Template.puzzlePage.puzzleId = function () {
  return Session.get("route.puzzleId");
};

Template.puzzlePage.puzzle = function () {
  return Puzzles.findOne(Session.get("route.puzzleId"));
};
