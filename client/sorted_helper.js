// for use with #each
Handlebars.registerHelper("sorted", function (data) {
  if (!data)
    return [];
  return _.clone(data).sort();
});
