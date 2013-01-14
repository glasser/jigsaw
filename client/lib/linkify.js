Handlebars.registerHelper('linkify', function (options) {
  return linkify(options.fn(this), {
    callback: function (text, href) {
      return href ? '<a href="' + href + '" target="_blank">' + text + '</a>' : text;
    }
  });
});
