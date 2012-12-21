var queryUrlToSelector = function (query) {
  // no specific queries
  return {};
};

var JigsawRouterClass = Backbone.Router.extend({
  routes: {
    "puzzle/:puzzleId": "puzzle",
    "search/*query": "search",
    "": "search"
  },
  search: function (query) {
    Session.set("route.puzzleId", undefined);
    Session.set("route.searchQuery", queryUrlToSelector(query));
  },
  puzzle: function (puzzleId) {
    Session.set("route.puzzleId", puzzleId);
    Session.set("route.searchQuery", undefined);
  },
  showPuzzle: function (puzzleId) {
    this.navigate("puzzle/" + puzzleId, true);
  },
  currentPuzzleId: function () {
    return Session.get("route.puzzleId");
  },
  currentPuzzle: function () {
    var id = this.currentPuzzleId();
    if (!id)
      return null;
    return Puzzles.findOne(id);
  },
  showingSearch: function () {
    return !Session.equals("route.searchQuery", undefined);
  },
  currentSearch: function () {
    return Puzzles.find(Session.get("route.searchQuery"));
  }
});

JigsawRouter = new JigsawRouterClass;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
