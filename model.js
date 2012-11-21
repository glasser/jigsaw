// PUZZLES

Puzzles = new Meteor.Collection('puzzles');

// schema:
//   title: string
//   tags: list of tags (which in HQ neded to be identifier-style)
//   families: object
//       family -> family value (strings)
//   metadata: object
//       metadata name -> value
//   relatedQueries: list of puzzle queries?

if (Meteor.isServer) {
  Meteor.publish('puzzle', function (puzzleId) {
    return Puzzles.find({_id: puzzleId});
  });
} else {
  Meteor.autosubscribe(function () {
    var puzzleId = Session.get('route.puzzleId');
    if (puzzleId)
      Meteor.subscribe('puzzle', puzzleId);
  });
}


// puzzle queries need sorts (which was weird in AE), tags, negative tags,
// metadata to show


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
