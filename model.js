// PUZZLES

Puzzles = new Meteor.Collection('puzzles');

// schema:
//   title: string
//   tags: list of tags (which in HQ neded to be identifier-style)
//   families: object
//       family ID -> family value (strings)
//   metadata: object
//       metadata ID -> value
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


// puzzle queries need sorts (which was weird in AE), tags, negative tags,
// metadata to show. families were like tags. also, by default we filter out
// 'deleted'

// METADATA for puzzles
PuzzleMetadata = new Meteor.Collection('puzzleMetadata');
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
}

// FAMILIES of tags for puzzles (ie, popups)
Families = new Meteor.Collection('families');
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
