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
  return '<a href="/puzzle/' + puzzleId + '">' + _.escape(text) + '</a>';
};

// puzzle queries need sorts (which was weird in AE), tags, negative tags,
// metadata to show. families were like tags. also, by default we filter out
// 'deleted'

// METADATA for puzzles
PuzzleMetadata = newCollection('puzzleMetadata');
// schema:
//   name: string
//   url: bool
//   showInSearch: bool

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
    PuzzleMetadata.insert({name: "Puzzle URL", url: true, showInSearch: true});
    PuzzleMetadata.insert({name: "Answer", showInSearch: true});
    PuzzleMetadata.insert({name: "Wrong answers"});
  }
} else {
  Handlebars.registerHelper("allMetadata", function () {
    // Want to sort in some consistent order; maybe should actually define a
    // sort key or something later.
    return PuzzleMetadata.find({}, {sort: ['name']});
  });
  Handlebars.registerHelper("metadataInSearch", function () {
    // Want to sort in some consistent order; maybe should actually define a
    // sort key or something later.
    return PuzzleMetadata.find({showInSearch: true}, {sort: ['name']});
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
Comments = newCollection('comments');
// schema:
//    puzzleId
//    created date
//    updated date (optional)
//    author
//    text
//    version
//    priority: important, normal, useless
var COMMENT_PRIORITIES = ['important', 'normal', 'useless'];
if (Meteor.isServer) {
  // XXX Need to make a supported way of calling this.
  Comments._ensureIndex('puzzleId');
  Jigsaw.publish('comments-by-puzzle', function (puzzleId) {
    return Comments.find({puzzleId: puzzleId});
  });
} else {
  Meteor.autosubscribe(function () {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.subscribe('comments-by-puzzle', puzzleId);
  });
}

var normalizeCommentText = function (text) {
  if (!(/\S/.test(text)))
    return null;
  if (text.substr(text.length - 1) !== '\n')
    return text + '\n';
  return text;
};

// Comments can only be created via this function. Note that this will fail if
// called on the client outside of a stub. Returns true if a comment was
// created.
var createComment = function (puzzleId, text) {
  text = normalizeCommentText(text);
  if (text === null)
    return false;
  var author = Meteor.user().username;
  if (!author)
    return false;
  if (!puzzleId)
    return false;
  Comments.insert({puzzleId: puzzleId,
                   created: +(new Date),
                   author: author,
                   text: text,
                   version: 1,
                   priority: 'normal'});
  return true;
};

// UPLOADS
Uploads = newCollection('uploads');
// schema:
//    puzzleId
//    filepicker (the filepicker.io data)
//      url (to filepicker.io)
//      filename
//      mimetype
//      size
//      isWritable
//      key (in s3)
//    created date
//    author
if (Meteor.isServer) {
  // XXX Need to make a supported way of calling this.
  Uploads._ensureIndex('puzzleId');
  Jigsaw.publish('uploads-by-puzzle', function (puzzleId) {
    return Uploads.find({puzzleId: puzzleId});
  });
} else {
  Meteor.autosubscribe(function () {
    var puzzleId = JigsawRouter.currentPuzzleId();
    if (puzzleId)
      Meteor.subscribe('uploads-by-puzzle', puzzleId);
  });
}

// Comments can only be created via this function. Note that this will fail if
// called on the client outside of a stub. Returns true if a comment was
// created.
var createUpload = function (puzzleId, filepicker) {
  var author = Meteor.user().username;
  if (!author)
    return false;
  if (!puzzleId)
    return false;
  Uploads.insert({puzzleId: puzzleId,
                  created: +(new Date),
                  author: author,
                  filepicker: filepicker});
  return true;
};

// Upload config.
if (Meteor.isServer) {
  // does NOT use Jigsaw.publish
  Meteor.publish("upload-config", function () {
    if (this.userId) {
      this.added('UploadConfig', 'singleton',
                 Meteor.settings.publicUploadConfig);
      this.complete();
    } else {
      // leave incomplete until after login!
    }
    return null;
  });
} else {
  var uploadConfigCollection = new Meteor.Collection("UploadConfig");
  var UPLOAD_CONFIG = {};
  Meteor.subscribe("upload-config", function () {
    var config = uploadConfigCollection.findOne();
    if (config) {
      UPLOAD_CONFIG = config;
      filepicker.setKey(UPLOAD_CONFIG.filepickerKey);
    }
  });
}


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
//     created (server-side timestamp)

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
// display recent things that happened
HeaderLinks = newCollection('headerLinks');
//  schema:
//     text: string
//     href: string
//     created (server-side timestamp)

if (Meteor.isServer) {
  Jigsaw.publish(null, function () {
    return HeaderLinks.find();
  });

  // You don't get to update links, and insert is done via method to add
  // server-side timestamp, but remove is OK.
  HeaderLinks.allow({
    remove: function () { return true; }
  });
} else {
  Handlebars.registerHelper("allHeaderLinks", function () {
    return HeaderLinks.find({}, {sort: {created: 1}});
  });
}

// CUSTOM CSS
// XXX
