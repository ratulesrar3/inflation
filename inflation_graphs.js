// inflation_graphs.js
// only possible becaues of Mark Vandergon and Jim Vallandingham's scrolling implementations
// 

// width and height are set by the render
var margin = {top: 20, right: 40, bottom: 40, left: 50};
var parseTime = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(function(d) { return parseTime(d.x); }).left;

function drawLine(path, duration=2000) {
  var totalLength = path.node().getTotalLength();
  path
    .style('opacity',1)
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .ease(d3.easeCubic)
      .duration(duration)
      .attr("stroke-dashoffset", 0);
}

function makeLegend(start, num_series) {
  var d = ["Aggregate CPI (BLS)", "Online (PriceStats)", "Food CPI (BLS)", "Housing CPI (BLS)", "Energy CPI (BLS)"].slice(start, num_series)
  var r = ['#42c8f4','#f47941', '#6a8dd5','#a041f4','#50bf11'].slice(start, num_series)

  var legendSize = 200;
  var ordinal = d3.scaleOrdinal()
    .domain(d)
    .range(r);

  d3.select('.legend')
  var legend = d3.select('svg').append("g")
    .attr("class", "legend")
    .attr("transform", "translate("+(svgWidth - legendSize) +","+ 2*margin.top +")");
  var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(legendSize)())
    .shapePadding(10)
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(ordinal);

  legend.call(legendOrdinal);
}

(function makePlot() {

  var svg = d3.select('#graph').append('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight)
  var width = +svg.attr("width") - margin.left - margin.right;
  var height =  +svg.attr("height") - margin.top - margin.bottom;

  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var tooltip = d3.select('#tooltip');
  var tooltipLine = svg.append('line');

  var x = d3.scaleTime()
  .rangeRound([0, width]);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal(d3.schemeCategory10);


  // data
  var datafile = 'quarterly_inflation.csv';

  // load and plot the first chart
  d3.csv(datafile, function(d) {
    // wrangle
    d.date = parseTime(d.date);
    d.pricestats = +d.pricestats;
    d.bls_food = +d.bls_food;
    d.bls_energy = +d.bls_energy;
    d.bls_housing = +d.bls_housing;
    d.bls_agg = +d.bls_agg;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.bls_energy; }));

    var priceStats = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.pricestats); })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var blsFood = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.bls_food); })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var blsEnergy = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.bls_energy); })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var blsHousing = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.bls_housing); })
      .curve(d3.curveCatmullRom.alpha(0.5));
    var blsAll = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.bls_agg); })
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append("g")
      .attr("transform", "translate(0," + height+ ")")
      .call(d3.axisBottom(x))
      .attr('class', 'axis')
      .select(".domain");
      //.remove();

    g.append("g")
      .call(d3.axisLeft(y))
      .attr('class', 'axis')
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Inflation Index");

    // plotting the cpi aggregate
    var cpi = g.append("path")
      .attr("id", "cpi")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#42c8f4")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", blsAll);

    // plot pricestats online rate
    var ps =  g.append("path")
      .style("opacity", 0)
      .attr("id", "price-stats")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f47941")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", priceStats)

    // plotting the remaining bls rates
    var food =  g.append("path")
      .style("opacity", 0)
      .attr("id", "food-cpi")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#6a8dd5")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", blsFood)

    var energy =  g.append("path")
      .style("opacity", 0)
      .attr("id", "energy-cpi")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#50bf11")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", blsEnergy)

    var housing =  g.append("path")
      .style("opacity", 0)
      .attr("id", "housing-cpi")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#a041f4")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", blsHousing)

    // create shading for the difference between rates
    var cpiUnder = d3.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) {return y(Math.max(d.bls_agg, d.pricestats))})
      .y1(function(d) {return y(d.pricestats)});

    var cpiOver = d3.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) {return y(Math.max(d.bls_agg, d.pricestats))})
      .y1(function(d) {return y(d.bls_agg)});

    g.append("path")
      .datum(data)
      .style("fill", "red")
      .style("fill-opacity", 0)
      .attr("class", "difference under")
      .attr("d", cpiUnder);

    g.append("path")
      .datum(data)
      .style("fill", "green")
      .style("fill-opacity", 0)
      .attr("class", "difference over")
      .attr("d", cpiOver);

    drawLine(cpi);
    //drawLine(ps);
    makeLegend(0,1);
  })

  // Add pricestats
  function addPs() {
    // increase the contrast between lines
    var cpi = d3.select('#cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 1)
                .attr("stroke", "#42c8f4")

    var ps = d3.select('#price-stats')
    drawLine(ps);
    makeLegend(0,2);
  }

  function addOverunder() {
    d3.selectAll('.difference').transition()
      .duration(2000)
      .style("fill-opacity", 0.2)
  }

  function addFood() {
    d3.selectAll('.legend').remove()
    d3.selectAll('.difference').transition().remove()
    var cpi = d3.select('#cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 0.5)
                .attr("stroke", "#696969")
    var ps = d3.select('#price-stats')
                .transition()
                .delay(250)
                .attr("stroke-width", 0.5)
                .attr("stroke", "#696969")
    var food = d3.select('#food-cpi')
    drawLine(food);
    makeLegend(2,3);
  }

  function addHousing() {
    d3.selectAll('.legend').remove()
    var food = d3.select('#food-cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 0)
                .attr("stroke", "#696969")
    var housing = d3.select('#housing-cpi')
    drawLine(housing);
    makeLegend(3,4);
  }

  function addEnergy() {
    d3.selectAll('.legend').remove()
    var housing = d3.select('#housing-cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 0)
                .attr("stroke", "#696969")
    var energy = d3.select('#energy-cpi')
    drawLine(energy);
    makeLegend(4,5);
  }

  function play() {
    d3.selectAll('.legend').remove()
    var cpi = d3.select('#cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 0)
                .attr("stroke", "#42c8f4")
    var ps = d3.select('#price-stats')
                .transition()
                .delay(500)
                .attr("stroke-width", 0)
                .attr("stroke", "#f47941")            
    var food = d3.select('#food-cpi')
                .transition()
                .delay(250)
                .attr("stroke-width", 1)
                .attr("stroke", "#6a8dd5")
    var housing = d3.select('#housing-cpi')
                .transition()
                .delay(500)
                .attr("stroke-width", 1)
                .attr("stroke", "#a041f4")
    var energy = d3.select('#energy-cpi')
                .transition()
                .delay(750)
                .attr("stroke-width", 1)
                .attr("stroke", "#50bf11")
      //drawLine(energy);
      makeLegend(2,5);
  }


  // update functions
  var updateFunction = d3.range(d3.selectAll('#container-1 section > div').size())
    .map(function(){ return function(){} })

  // update the graph at these positions
  updateFunction[2] = addPs;
  updateFunction[3] = addOverunder;
  updateFunction[4] = addFood;
  updateFunction[5] = addHousing;  
  updateFunction[6] = addEnergy;
  updateFunction[7] = play;
  //updateFunction[8] = play;

  var lastIndex = 0
  var activeIndex = 2
  var gs = d3.graphScroll()
    .graph(d3.selectAll('#graph'))
    .container(d3.select('#container-1'))
    .sections(d3.selectAll('#container-1 section > div'))
    .eventId('c1')
    .on('active',function(i) {
      activeIndex = i
      // call all fns last and active index
      var sign = activeIndex - lastIndex < 0 ? -1 : 1
      if (sign < 1) {
        // clear graph doesn't really work, have to refresh page
        d3.select("svg").remove()
        makePlot();
      }
      d3.range(lastIndex + sign, activeIndex + sign, sign).forEach(function(i){
        updateFunction[i]();
      })
      lastIndex = activeIndex
  });
})()






