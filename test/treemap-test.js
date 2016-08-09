var tape = require("@redsift/tape-reel")("<div id='test'></div>");
    d3 = require("d3-selection"),
    treemap = require("../");

tape("treemap html() generates sth with no data", function(t) {
    var host = treemap.html();
    var el = d3.select('#test');

    // nothing supplied
    el.call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    // empty datum
    el.datum([]).call(host);
    t.equal(el.selectAll('svg').size(), 1);
    
    t.end();
});

