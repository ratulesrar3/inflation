
/**
 * scrollSections - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollSections = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // scatter plot scales
  var xScatterScale = d3.scaleTime()
    .rangeRound([0, width]);
  var yScatterScale = d3.scaleLinear()
    .rangeRound([height, 0]);
  var xScatterScale2 = d3.scaleTime()
    .rangeRound([0, width]);
  var yScatterScale2 = d3.scaleLinear()
    .rangeRound([height, 0]);

  var parseTime = d3.timeParse("%Y-%m-%d");

  // setup scatter axes
  var xAxisScatter = d3.axisBottom()
    .scale(xScatterScale);
  var yAxisScatter = d3.axisLeft(yScatterScale);

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([inflationData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var inflationData = getIndexVals(rawData);
      var dailyInflation = getDailyVals(inflationData);
      var cpiInflation = getCPI(inflationData);

      // set the scatter scale's domain
      var scatterMax = d3.max(inflationData, function(d) { return d.index_val; });
      xScatterScale.domain(d3.extent(inflationData, function(d) { return d.date; }));
      yScatterScale.domain([85, scatterMax])

      setupVis(inflationData, cpiInflation, dailyInflation);

      setupSections();
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function (wordData, cpiInflation, dailyInflation) {
    // axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxisScatter);
    g.select('.x.axis').style('opacity', 0);

    // cpi scatter plot
    var dots = g.selectAll('.dot').data(cpiInflation);
    var dotsE = dots.enter()
      .append('circle')
      .attr('class', 'dot');
    dots = dots.merge(dotsE)
      .attr('r', 5)
      .style('display', 'inline')
      .attr('cx', function(d) { return xScatterScale(d.date); })
      .attr('cy', function(d) { return yScatterScale(d.index_val); });

    // daily scatter plot
    var dailyDots = g.selectAll('.dot').data(dailyInflation);
    var dailyDotsE = dailyDots.enter()
      .append('circle')
      .attr('class', 'dailyDot');
    dailyDots = dailyDots.merge(dailyDotsE)
      .attr('r', 1)
      .style('display', 'none')
      .attr('cx', function(d) { return xScatterScale(d.date); })
      .attr('cy', function(d) { return yScatterScale(d.index_val); });

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes

    activateFunctions[0] = showScatter;
    activateFunctions[1] = showDailyScatter;
    // activateFunctions[2] = showBar;
    // activateFunctions[3] = showHistPart;
    // activateFunctions[4] = showHistAll;
    // activateFunctions[5] = showCough;
    // activateFunctions[6] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 7; i++) {
      updateFunctions[i] = function () {};
    }
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  // showScatter
  // hides filler count title
  // hide grid
  // shows cpi scatter
  function showScatter() {
    g.selectAll('.dot')
      .transition()
      .duration(600)
      .style('display', 'inline')
      .attr('fill', '#000000');

    g.selectAll('.dailyDot')
      .trasition()
      .duration(0)
      .style('display', 'none')

    showAxis(xAxisScatter);
    showAxisY(yAxisScatter);

    g.selectAll('.dot')
      .attr('height', function () { return 0; })
      .attr('y', function () { return height; })
      .style('display', 'inline');

  }

  // show daily scatter
  function showDailyScatter() {
    g.selectAll('.dailyDot')
      .transition()
      .duration(0)
      .style('display', 'inline');

    g.selectAll('.dot')
      .transition()
      .duration(600)
      .style('display', 'none')
      .attr('fill', '#008080');

    showAxis(xAxisScatter);
    showAxisY(yAxisScatter);

    g.selectAll('.dailyDot')
      .attr('height', function () { return 0; })
      .attr('y', function () { return height; })
      .style('display', 'inline');
  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(axis) {
    g.select('.x.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  function showAxisY(axis) {
    g.select('.y.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getIndexVals - maps raw data to
   * array of data objects. 
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */

  // getIndexVals
  function getIndexVals(rawData) {
    return rawData.map(function (d, i) {
      // is the price index value a daily calculation
      d.daily = (d.daily === '1') ? true : false;
      // or is it from BLS
      d.cpi = (d.cpi === '1') ? true : false;
      // food
      d.food = (d.food === '1') ? true : false;
      // housing
      d.housing = (d.housing === '1') ? true : false;
      // energy 
      d.energy = (d.energy === '1') ? true : false;
      // parse date object
      d.date = parseTime(d.date);
      // index value
      d.index_val = +d.index_val;

      return d;
    });
  }

  // getDailyVals
  function getDailyVals(data) {
    return data.filter(function(d) {return d.daily; });
  }

  // getCPI
  function getCPI(data) {
    return data.filter(function(d) {return d.cpi; });
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollSections();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.tsv('all_inflation.tsv', display);
