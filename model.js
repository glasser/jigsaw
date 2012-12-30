var newCollection = function (name) {
  var c = new Meteor.Collection(name);
  c.deny({
    insert: function (userId) { return !userId; },
    update: function (userId) { return !userId; },
    remove: function (userId) { return !userId; },
    fetch: []
  });
  return c;
};

// PUZZLES

Puzzles = newCollection('puzzles');

// schema:
//   title: string
//   tags: list of tags (which in HQ neded to be identifier-style)
//   families: object
//       family ID -> family value (strings)
//   metadata: object
//       metadata ID -> value
//   spreadsheets: list of objects
//       docId: string
//       link: string
//       embedLink: string
//   relatedQueries: list of puzzle queries? [XXX]

if (Meteor.isServer) {
  Jigsaw.publish('all-puzzles', function () {
    return Puzzles.find();
  });
} else {
  Meteor.subscribe("all-puzzles");
  // Meteor.autosubscribe(function () {
  //   var puzzleId = Session.get('route.puzzleId');
  //   if (puzzleId)
  //     Meteor.subscribe('puzzle', puzzleId);
  // });
}

var tagStringToArray = function (tagString) {
  var nonEmptyTags = _.filter(tagString.split(' '), _.identity);
  var lowerCaseTags = _.map(nonEmptyTags, function (t) {
    return t.toLowerCase();
  });
  return _.uniq(lowerCaseTags);
};

// used in newsfeeds, etc
var puzzleLink = function (puzzleId, text) {
  return '<a href="/puzzle/' + puzzleId + '">' + text + '</a>';
};

// puzzle queries need sorts (which was weird in AE), tags, negative tags,
// metadata to show. families were like tags. also, by default we filter out
// 'deleted'

// METADATA for puzzles
PuzzleMetadata = newCollection('puzzleMetadata');
// schema:
//   name: string
//   url: bool

if (Meteor.isServer) {
  Jigsaw.publish(null, function () {
    return PuzzleMetadata.find();
  });

  // XXX add admin methods for PuzzleMetadata instead
  PuzzleMetadata.allow({
    insert: function () { return true; },
    remove: function () { return true; },
    update: function () { return true; }
  });

  // Initial data!
  if (PuzzleMetadata.find().count() === 0) {
    PuzzleMetadata.insert({name: "Puzzle URL", url: true});
    PuzzleMetadata.insert({name: "Answer"});
    PuzzleMetadata.insert({name: "Wrong answers"});
  }
} else {
  Handlebars.registerHelper("allMetadata", function () {
    // Want to sort in some consistent order; maybe should actually define a
    // sort key or something later.
    return PuzzleMetadata.find({}, {sort: ['name']});
  });
}

// FAMILIES of tags for puzzles (ie, popups)
Families = newCollection('families');
// schema:
//    name: string
//    values: array of string
//    default: string (should be in values)

if (Meteor.isServer) {
  Jigsaw.publish(null, function () {
    return Families.find();
  });

  // XXX add admin methods for Families instead
  Families.allow({
    insert: function () { return true; },
    remove: function () { return true; },
    update: function () { return true; }
  });

  // Initial data!
  if (Families.find().count() === 0) {
    Families.insert({
      name: "Status",
      values: ["New", "Solved", "Needs Insight", "Needs Research"],
      default: "New"
    });
  }
} else {
  Handlebars.registerHelper("allFamilies", function () {
    // Want to sort in some consistent order; maybe should actually define a
    // sort key or something later.
    return Families.find({}, {sort: ['name']});
  });
}

// COMMENTS

// schema:
//    puzzleId
//    replacedBy (for versioning)
//    created date
//    author
//    text
//    priority: important, normal, useless


// BANNERS
// manually-set banners that go on every page
Banners = newCollection('banners');
//  schema:
//     content
//     created (server-side timestamp)

if (Meteor.isServer) {
  Jigsaw.publish(null, function () {
    return Banners.find();
  });

  // You don't get to update banners, and insert is done via method to add
  // server-side timestamp, but remove is OK.
  Banners.allow({
    remove: function () { return true; }
  });
} else {
  Handlebars.registerHelper("allBanners", function () {
    return Banners.find({}, {sort: {created: -1}});
  });
}

// NEWSFEED
// display recent things that happened
Newsfeed = newCollection('newsfeed');
//  schema:
//     htmlContent: *HTML* STRING
//     created (server-side timestamp --- always create via this function)

if (Meteor.isServer) {
  Jigsaw.publish(null, function () {
    return Newsfeed.find({}, {sort: {created: -1}, limit: 10});
  });
} else {
  Handlebars.registerHelper("newsfeed", function () {
    return Newsfeed.find({}, {sort: {created: -1}});
  });
}

// Newsfeeds can only be created via this function. Note that this will fail if
// called on the client outside of a stub.
var createNewsfeed = function (htmlContent) {
  Newsfeed.insert({htmlContent: htmlContent, created: (+new Date)});
};

// HEADER LINKS
// CUSTOM CSS
