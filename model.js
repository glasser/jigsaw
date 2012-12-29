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
//   relatedQueries: list of puzzle queries?

if (Meteor.isServer) {
  Jigsaw.publish('all-puzzles', function () {
    return Puzzles.find();
  });

  // XXX add add/remove puzzle methods instead
  Puzzles.allow({
    insert: function () { return true; },
    remove: function () { return true; }
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
      values: ["New", "Solved", "Needs Insight", "Needs Research"]
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
// manually set banners that go on every page

//  schema:
//     content
//     created

// NEWSFEED
// display recent things that happened

//  schema:
//     content
//     created

// HEADER LINKS
// CUSTOM CSS
