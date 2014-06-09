/*

Big picture panel.

A histogram, basically.

But this one is fancified such that the bars
are constructed of piles of boxes.

*/

define(
  ["d3",
   "d3-tip",
   "underscore",
   "helpers",
   "config"],
  function (
    d3,
    d3tip,
    _,
    u,
    c) {

    function panel1 (data) {

      // Local copy of the data.
      var data = data.slice(0) ;

      // Local viz parameters.
      var padding = 1,
          boxEdge = 9,
          paddedbox = padding + boxEdge,
          rowWidth = 4,
          rowPadding = 6,
          bins = 12,
          barsHeight = c.vizHeight - 20;

      // The master SVG container.
      // All viz elements are drawn within sub-elements dependent on this one.
      var svg = d3.select("#chart-1")
      .append("svg")
      .attr("width", c.width)
      .attr("height", c.height) ;

      // Sub-containers for the text box and the visualization.
      var vizBox = svg.append("g") ;
      var textBox = svg.append("g")
      .attr("transform",
            "translate(" + 0 + "," + (c.vizHeight+c.textBoxMargin) + ")") ;

      // The content of the text box.
      var text = "Killings of people protecting land and the environment are increasing." ;
      // Fill in the text box...
      writeText(text) ;
      function writeText (text) {
        // The function which draws the text box.
        textBox
        .append("foreignObject")
        .attr("width", c.width)
        .attr("height", (c.height-c.vizHeight))
        .append("xhtml:body")
        .attr("class", "caption")
        .text(text) ;
      } ;


      // The x and y scales, plus the histogram.
      var x = d3.time.scale()
      .domain(d3.extent(data.map(function (d) { return d[c.datefield]; })))
      .range([0,c.width]) ;

      var histBreaks =
          // The breakpoints for the histogram.
          _.map(
            _.map(
              _.map(_.range(2,15),function (d) {
                if (d < 10) {
                  return "0" + d;
                } else {
                  return "" + d
                }
              }), function (d) {
                return "20" + d;
              }), function (d) {
              return new Date(d + "-01-01");
            });

      var hist = u.ranges(histBreaks).map(function (d) {
        return data.filter(function (e) {
          return (e[c.datefield] >= d[0] &&
                  e[c.datefield] < d[1]) ;
        }) ;
      }) ;

      // SVG containers for the bars of the histogram.
      var barBox = vizBox.append("g") ;
      var bars = barBox.append("g")
      .attr("transform", "translate(" + (rowPadding/2) + ",0)") ;


      function createBarG (d,i) {
        var theRow = bars.append("g")
        .attr("transform", "translate(" +
              (((rowWidth*paddedbox)+rowPadding)*i) +
              ",0)") ;

        return theRow ;
      } ;

      var histBars = hist.map(createBarG) ;

      vizBox.attr("transform", "translate(" +
                  (c.width-(((rowWidth*paddedbox)+rowPadding)*hist.length))/2 +
                  ",0)") ;

      // The X axis.
      var alignedX = d3.time.scale()
      .domain([new Date("2002","01","01"), new Date("2014", "01", "01")])
      .range([0,(((rowWidth*paddedbox)+rowPadding)*hist.length)]) ;
      var xAxis = d3.svg.axis()
      .scale(alignedX)
      .tickValues(_.map(_.range(2,14),
                        function (n) { return new Date("20"+u.pad(n),"01","01"); }))
      .ticks(d3.time.year)
      .outerTickSize(0)
      .tickFormat(function (d) { var e = new Date(d); return d3.time.format("%Y")(e) ;})
      .orient("bottom") ;

      function drawAxis () {
        barBox.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + barsHeight + ")")
        .call(xAxis) ;
      } ;

      // The tooltip display.
      var tip = d3tip()
      .attr('class', 'd3-tip')
      .offset(function (d,i) {
        return (i > 123) ? [5,0] : [-5,0];
      })
      .direction(function (d,i) {
        return (i > 123) ? 's' : 'n';
      })
      .html(function(d) {
        var chunks = [
          "<strong>Location</strong>: " + d["Geographical Term"],
          "<strong>Date</strong>: " + d3.time.format("%d %B %Y")(d[c.datefield]),
          //"<strong>Type of act</strong>: " + d["Type Of Act"],
          "<strong>Victim: </strong>" + d[c.victimfield]
        ] ;
        if (d["Sex"] !== "") chunks.push("<strong>Sex: </strong>" + d["Sex"]);
        return chunks.join("<br>") ;
      }) ;

      function update (subset, i) {
        var thisBar = histBars[i].append("g").attr("class", "bar") ;

        thisBar.call(tip);

        var theUpdate = thisBar.selectAll(".box").data(subset) ;
        var duration = 4;

        theUpdate.enter()
        .append("rect")
        .attr("class", "box")
        .attr("width", boxEdge)
        .attr("height", boxEdge)
        .attr("x", function (d,i) { return (column(i) * paddedbox) ; })
        .attr("y", function (d,i) { return (barsHeight - (row(i) * paddedbox) - paddedbox) ; })
        .attr("opacity", 0)
        .on("mouseover", function (d,i) {
          if (d3.select(this).attr("opacity") === "1") tip.show(d,i);
        })
        .on("mouseout", tip.hide) ;

        theUpdate.transition()
        .duration(duration)
        .delay(function (d,j) {return j*duration + u.countPrev(hist,i+1)*duration;})
        .attr("opacity", "1") ;

        var thisText = thisBar.append("text")
        .attr("y", (barsHeight - (row(subset.length-1) * paddedbox))-paddedbox*1.5)
        .attr("x", (paddedbox*rowWidth)/2)
        .attr("class", "label")
        .text(subset.length)
        .style("opacity", 0) ;

        thisText.transition()
        .duration(duration)
        .delay(function () {return u.countPrev(hist,i+1)*duration + subset.length*duration; })
        .style("opacity", 1) ;

        function row (i) {
          return Math.floor(i / rowWidth) ;
        } ;

        function column (i) {
          return (i % rowWidth) ;
        } ;

      } ;

      return {
        init: function () { hist.map(update); drawAxis(); },
        kill: function () { vizBox.selectAll(".bar").remove(); vizBox.selectAll(".axis").remove() }
      } ;
    } ;

    return panel1;

  }) ;

