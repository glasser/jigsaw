Template.searchPage.showing = function () {
  return JigsawRouter.showingSearch();
};

Template.searchPage.search = function () {
  return JigsawRouter.currentSearch();
};
