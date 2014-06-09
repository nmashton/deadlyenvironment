/*

Conviction rate panel.

Cases arranged in concentric squares
and faded by their conviction status.

*/
define(
  ["d3",
   "d3-tip",
   "underscore",
   "config"],
  function (d3, d3tip, _, c) {
    return panel3;

    function panel3(data) {

      // Local copy of the data.
      var data = data.slice(0) ;

      // The "global" var for the interval function.
      var interval ;

      // The content of the text box.
      var text = "The perpetrators are mostly unknown and almost entirely unpunished." ;

      // Local viz parameters.
      var padding = 1,
          boxEdge = 7,
          paddedbox = padding + boxEdge,
          rowHeight = 8,
          rowPadding = paddedbox+2 ;

      // The master SVG container.
      // All viz elements are drawn within sub-elements dependent on this one.
      var svg = d3.select("#chart-3")
      .append("svg")
      .attr("width", c.width)
      .attr("height", c.height) ;

      // Sub-containers for the text box and the visualization.
      var vizBox = svg.append("g") ;
      var textBox = svg.append("g")
      .attr("transform",
            "translate(" + 0 + "," + (c.vizHeight+c.textBoxMargin) + ")") ;


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


      // Sort the dataset by its impunity level.
      var categorizedData = _.groupBy(data, impunity) ;
      var impunityLevels = ["no-info", "perp", "named", "conviction"] ;

      function impunity (d) {
        // Categorize a data point by its level of impunity.
        if (d["Conviction secured"] === "Yes") {
          return "conviction" ;
        } else if (d["Named perpetrator"] === "Yes") {
          return "named" ;
        } else if (d["Has perpetrator information"] === "Yes") {
          return "perp" ;
        } else {
          return "no-info" ;
        }
      } ;

      // Center the viz, using the new information...
      vizBox.attr("transform", "translate(" +
                  ((c.width-(column(categorizedData["no-info"].length)*paddedbox))/2) +
                  ",0)") ;

      // Sub-containers for the different impunity categories.

      var rowXOff = 0,
          labelheight = 30,
          manualYOff = 15 ;

      var rowsGroup = vizBox.append("g")
      .attr("transform","translate(0," +
            (((c.vizHeight - (((rowHeight*paddedbox)+rowPadding)*4 + labelheight*5))/2)+manualYOff) + ")");

      function createRow(i,t) {
        var row = rowsGroup.append("g")
        .attr("transform", "translate(" +
              rowXOff + "," +
              (((rowHeight*paddedbox)+rowPadding)*i + labelheight*(i+1)) + ")") ;

        row.append("text")
        .attr("class", "bar-caption")
        .text(t) ;

        var boxRow = row.append("g")
        .attr("transform", "translate(0," + labelheight/3.5 + ")") ;

        return boxRow ;
      } ;

      var row1Boxes = createRow(0,"Killings where there is no information about the suspected killer(s)"),
          row2Boxes = createRow(1,"Killings where there is very limited information about the suspected killer(s), but no name"),
          row3Boxes = createRow(2,"Killings where the suspected killer(s) have been named"),
          row4Boxes = createRow(3,"Killings where the killler(s) were tried, convicted, and punished") ;

      var rows = {
        // A map from impunity levels to SVG groups.
        "no-info": row1Boxes,
        "perp": row2Boxes,
        "named": row3Boxes,
        "conviction": row4Boxes
      } ;



      // A fill scale for impunity levels.

      var fill = d3.scale.ordinal()
      .domain(impunityLevels)
      .range(["grey", "red", "orange", "green"]) ;



      function tickThrough () {
        /*
    Walks through the data step by step, moving a window
    over the data, repeatedly calling `flashDatum` on
    the subset of the data covered by the window.
    */
        var min = data[0][c.datefield].getTime() ;
        var max = data[data.length-1][c.datefield].getTime() ;

        var autoplayDuration = 25,
            step = (max-min) / 64,
            currentPoint = min ;

        interval = setInterval(
          function () {
            if (currentPoint <= max) {
              impunityLevels.forEach(function (k) {
                update(categorizedData[k],k,currentPoint) ;
              }) ;
            } else {
              clearInterval(interval);
              impunityLevels.forEach(function (k) {
                addLabel(k,max);
              })
            } ;
            currentPoint += step ;
          },
          autoplayDuration)
      } ;


      // The tooltip display.
      function cond (d,i) {
        return (impunity(d) === "no-info" && row(i) <= 4) ;
      } ;

      var tip = d3tip()
      .attr('class', 'd3-tip')
      .offset(function (d,i) {
        return (cond(d,i)) ? [5,0] : [-5,0]
      })
      .direction(function (d,i) {
        return (cond(d,i)) ? "s" : "n";
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


      function update (subset, key, max) {
        /*
    Draws a square of boxes,
    assuming that their impunity type is `key`,
    and limiting them to be from before the time `max`.
    */

    var myData = subset.filter(function (d) { return (d[c.datefield].getTime() <= max) ;}) ;

    rows[key].call(tip);

    var theUpdate = rows[key].selectAll(".box").data(myData) ;

    theUpdate.enter()
    .append("rect")
    .attr("class", "box")
    .attr("width", boxEdge)
    .attr("height", boxEdge)
    .attr("x", function (d,i) { return (column(i) * paddedbox) ; })
    .attr("y", function (d,i) { return (row(i) * paddedbox) ; })
    .attr("opacity", "1")
    .style("fill", function (d) {
      return fill(impunity(d)) ;
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  } ;

      function column (i) {
        return Math.floor(i / rowHeight) ;
      } ;

      function row (i) {
        return (i % rowHeight) ;
      } ;

      return {
        init: function () {
          tickThrough(data) ;
        },
        kill: function () {
          vizBox.selectAll(".totals").remove()
          vizBox.selectAll(".bar-label").remove()
          vizBox.selectAll(".box").remove() ;
          clearInterval(interval) ;
        }
      } ;

      function addLabel (key, max) {
        // Adds numerical labels to each row.
        var i = categorizedData[key].length

        var theText = rows[key].append("text")
        .attr("y", (rowHeight)/2*paddedbox)
        .attr("x", column(i-1)*paddedbox + (paddedbox*1.5))
        .attr("class", "bar-label")
        .text(i) ;
      } ;
    }

  });
