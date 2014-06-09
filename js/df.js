define(
  ["underscore", "config"],
  function (_, c) {
    // Exports only transformData and csvHandler.

    function transformData (data) {
      // A function that runs the data through a series of transformations
      // to get it ready to be visualized.

      var mydata = data.slice(0) ;

      mydata = onlyKillings(validDates(sortByDate(mydata))) ;
      return mydata ;

    } ;

    function onlyKillings (data) {
      var mydata = data.slice(0) ;

      return _.filter(mydata,
                      function (d) {
                        var t = d["Type Of Act"]
                        return (t !== "Attempted killings" &&
                                t !== "Disappearance");
                      }) ;
    } ;

    function sortByDate (data) {
      // Sorts the dataset by date.
      var mydata = data.slice(0) ;
      mydata.sort(sortItems) ;
      return mydata ;

      function sortItems (d, e) {
        // A comparator function for the .sort() method for the array of data.
        var dt = d[c.datefield].getTime(),
            et = e[c.datefield].getTime() ;
        return dt - et ;
      } ;
    } ;

    function validDates (data) {
      // Filters the dataset by valid dates.
      return _.filter(data,function (d) { return !isNaN(d[c.datefield].getTime()) }) ;
    } ;

    function csvHandler (d) {
      // A function to pass to the CSV-parsing function which gets the data ready to work with.
      // This must be revised with every change of the dataset!

      // Formats the dates as dates and otherwise gets the data looking nice.
      d["Initial Date (Event)"] = new Date(d["Initial Date (Event)"]) ;
      /*if (d["Local Index"] === "") {
        d["Local Index"] = ["Unknown"] ;
      } else {
        d["Local Index"] = d["Local Index"].split(", ") ;
      } ;*/
      return d ;
    } ;

    return {
      transformData: transformData,
      csvHandler: csvHandler
    } ;

  }) ;
