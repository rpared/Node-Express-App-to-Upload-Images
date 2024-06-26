const hbs = require('hbs');

hbs.registerHelper('range', function (start, end) {
  let array = [];
  for (let i = start; i <= end; i++) {
    array.push(i);
  }
  return array;
});

hbs.registerHelper('add', function (value, addition) {
  return value + addition;
});

hbs.registerHelper('subtract', function (value, subtraction) {
  return value - subtraction;
});

hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('gt', function (a, b) {
  return a > b;
});

hbs.registerHelper('lt', function (a, b) {
  return a < b;
});
