Handlebars.registerHelper("huntTime", function (millis) {
  var m = moment(millis);
  m.utc();  // interpret as UTC
  m.add('hours', -5);  // eastern in January
  return m.format('ddd h:mm A');
});
