(function(){

// Since this app doesn't make users log in using Google, this uses a moderately
// sketchy approach where we store a refreshToken for a single user (eg
// robopop.api@gmail.com) in Meteor.settings and create all sheets on behalf of
// that user.  To set this up:
//
//   $ meteor add accounts-google accounts-ui
//
// Add {{loginButtons}} to some template and
//
//  Accounts.ui.config({
//    requestPermissions: {
//      google: ['https://www.googleapis.com/auth/drive.file']
//    },
//    requestOfflineToken: {
//      google: true
//    }
//  });
//
// to some client code. Configure Google login (setting up API access). While
// setting up API access, also go to the "services" tab and enable Drive API.
// Now log in to the app as the user whose credentials you want to borrow.
// Finally, go into "meteor mongo" and copy the refreshToken for that user in
// Meteor.users.  Revert all code changes and reset the DB. Write a
// settings.json containing:
//   {
//     "googleApi": {
//       "clientId": "CLIENT ID FROM GOOGLE REGISTRATION",
//       "clientSecret": "CLIENT SECRET FROM GOOGLE REGISTRATION",
//       "refreshToken": "REFRESH TOKEN FOR DUMMY USER"
//     }
//   }
//
// Now deploy or run with --settings=settings.json.



var getAccessToken = function (googleApiSettings) {
  var result = Meteor.http.post(
    "https://accounts.google.com/o/oauth2/token", {params: {
      client_id: googleApiSettings.clientId,
      client_secret: googleApiSettings.clientSecret,
      refresh_token: googleApiSettings.refreshToken,
      grant_type: 'refresh_token'
    }});

  if (result.error) // if the http response was an error
    throw result.error;
  if (result.data.error) // if the http response was a json object with an error attribute
    throw result.data;
  if (!result.data.access_token)
    throw new Meteor.Error(500, "expected access_token");
  return result.data.access_token;
};

var createSpreadsheet = function (accessToken, title) {
  var result = Meteor.http.post(
    "https://www.googleapis.com/drive/v2/files", {
      params: {
        access_token: accessToken
      },
      data: {
        mimeType: "application/vnd.google-apps.spreadsheet",
        title: title
      }
    });
  if (result.error) // if the http response was an error
    throw result.error;
  if (result.data.error) // if the http response was a json object with an error attribute
    throw result.data;
  return result.data;
};

var addLinkPermission = function (accessToken, docId) {
  var result = Meteor.http.post(
    "https://www.googleapis.com/drive/v2/files/" + docId + "/permissions", {
      params: {
        access_token: accessToken
      },
      data: {
        role: "writer",
        type: "anyone",
        withLink: true
      }
    });
  if (result.error) // if the http response was an error
    throw result.error;
  if (result.data.error) // if the http response was a json object with an error attribute
    throw result.data;
};


Jigsaw.methods({
  createSpreadsheet: function (puzzleId, title) {
    if (!Meteor.settings || !Meteor.settings.googleApi)
      throw new Meteor.Error(500, "google API not configured");
    if (!Puzzles.findOne(puzzleId))
      throw new Meteor.Error(404, "no such puzzle");
    var accessToken = getAccessToken(Meteor.settings.googleApi);
    var sheetDoc = createSpreadsheet(accessToken, title);
    addLinkPermission(accessToken, sheetDoc.id);
    Puzzles.update(puzzleId, {$push: {spreadsheets:
                                      {docId: sheetDoc.id,
                                       link: sheetDoc.alternateLink,
                                       embedLink: sheetDoc.embedLink}}});
  }
});
})();
