var ESCAPE = 27;
var ENTER = 13;

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keydown '+selector] =
    function (evt, template) {
      if (evt.which === ESCAPE) {
        // escape = cancel
        cancel.call(this, evt, template);
      } else if (evt.which === ENTER) {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        ok.call(this, evt, template, value, evt.target);
        // On IE10, without this, hitting enter will also click on some random
        // button.
        evt.preventDefault();
      }
    };
  return events;
};

var addButtonEvents = function (inputSelector, clickSelector, f) {
  var events = okCancelEvents(inputSelector, {ok: f});
  events['click ' + clickSelector] = function (event, template) {
    var input = template.find(inputSelector);
    if (!input)
      return;
    f(event, template, input.value || '', input);
  };
  return events;
};
