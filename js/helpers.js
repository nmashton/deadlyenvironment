define(
  ["underscore"],
  function (_) {
    function countPrev (xs, i) {
      // Takes an array of arrays and an index.
      // Sums up the lengths of all sub-arrays before i.
      return _.reduce(
        xs.slice(0,i-1),
        function (acc,d) {
          return acc + d.length;
        },
        0
      ) ;
    } ;

    function ranges (xs) {
      // Takes an array and returns a set of pairs
      // created by moving a two-element window over the array
      // (e.g. [1,2,3] => [[1,2],[2,3]]).
      if (xs.length < 2) {
        return [];
      } else {
        return [[xs[0],xs[1]]].concat(ranges(xs.slice(1))) ;
      } ;
    } ;

    function sum (ns) {
      return _.reduce(
        ns,
        function (acc,d) {
          return acc + d;
        },
        0
      ) ;
    } ;

    function pad (n) {
      return (n < 10) ? "0" + n : "" + n ;
    } ;

    function log (n, base) {
      var l = Math.log;
      return l(n)/(base ? l(base) : 1);
    } ;

    function repeatedly (i, f, n) {
      var arr = [i];
      var last = i;
      for (var j = 0; j < n; j++) {
        last = f(last);
        arr.push(last);
      };
      return arr;
    } ;

    function expscale (base, n) {
      return repeatedly(base, function (d) { return d*base;}, n);
    } ;

    return {
      countPrev: countPrev,
      ranges: ranges,
      sum: sum,
      pad: pad,
      log: log,
      repeatedly: repeatedly,
      expscale: expscale
    } ;


  }) ;
