requirejs.config({
  baseUrl: "js/",
  paths: {
    d3: "lib/d3",
    "d3-tip": "lib/d3-tip",
    topojson: "lib/topojson",
    "owl.carousel": "lib/owl.carousel",
    jquery: "lib/jquery",
    queue: "lib/queue",
    underscore: "lib/underscore"
  },
  shim: {"owl.carousel": ["jquery"]
  }
}) ;

// Workaround from https://github.com/mbostock/d3/issues/1693
define("d3.global", ["d3"], function(_) {
  d3 = _;
});

require(
  ["d3"
   , "jquery"
   , "owl.carousel"
   , "queue"
   , "df"
   , "config"
   , "panel1"
   , "panel2"
   , "panel3"
  ],
  function (
    d3
    , jquery
    , owl
    , queue
    , df
    , config
    , panel1
    , panel2
    , panel3
  ) {

    // Use the global constants to size and position the carousel.
    $("#viz-carousel")
    .css("width", config.width)
    .css("height", config.height)
    .css("left", "50%")
    .css("margin-left", -(config.width/2))
    ;

    /*
        Here, at the start of all things, load the data
        and send it to its handler.
    */
    queue()
    .defer(d3.json, "./data/world-topo.json")
    .defer(d3.csv, "./data/acts-pruned.csv", df.csvHandler)
    .await(dataCallback) ;

    function dataCallback(error, map, data) {
      var data = df.transformData(data) ;

      // For panels we haven't coded up yet.
      // Also for panels that have no dynamic elements.
      var stub = {
        init: function () { return null; },
        kill: function () { return null; }
      } ;

      // A map of all the initialization functions for the panels.
      // Used to redraw the panels when the carousel spins.
      var vizObjs = {} ;
      vizObjs[0] = panel1(data) ;
      vizObjs[1] = panel2(data, map) ;
      vizObjs[2] = panel3(data) ;
      vizObjs[3] = stub ; // This is going to be replaced by the report reader...

      function killOthers (n) {
        // Takes an index and calls the kill method on all panels not so indexed.
        var others = _.filter(_.keys(vizObjs), function (d) {return (d != n);}) ;
        _.each(others, function (d) {vizObjs[d].kill(); }) ;
      } ;

      // Set up the carousel interactivity.
      $("#viz-carousel").owlCarousel({
        navigation: true,
        rewindNav: false,
        slideSpeed: 400,
        paginationSpeed: 400,
        singleItem: true,
        afterMove: function (el) {vizObjs[this.currentItem].init() ;
                                  killOthers(this.currentItem); },
        afterInit: vizObjs[0].init
      }) ;

    } ;

  });
