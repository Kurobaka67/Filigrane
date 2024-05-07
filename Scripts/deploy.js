/* eslint-disable no-undef */

var ghpages = require('gh-pages');

ghpages.publish('dist', function(err) {
    console.log(err.message);
    process.exit(1);
});