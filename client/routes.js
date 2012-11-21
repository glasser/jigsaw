var JigsawRouterClass = Backbone.Router.extend({
  routes: {
    "puzzle/:puzzleId": "puzzle"
  },
  puzzle: function (puzzleId) {
    Session.set("route.puzzleId", puzzleId);
  },
  showPuzzle: function (puzzleId) {
    this.navigate("puzzle/" + puzzleId, true);
  }
});

JigsawRouter = new JigsawRouterClass;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
