// graphs.js

// scatter plot and brush adapted from Raj Vanisa & Mike Bostock
// http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
// https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

// scatter tooltip from d3noob
// https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73

// makeLegend function using d3-legend adapted from Mark Vandergon
// https://github.com/mdvandergon/monetary-policy/blob/master/graph.js

// multiline graph with toggle from d3noob
// https://bl.ocks.org/d3noob/08af723fe615c08f9536f656b55755b4

// mouseover tooltip for line from larsenmtl
// https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91

// define svg space
var margin = {top: 20, right: 20, bottom: 110, left: 50},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.timeParse('%Y-%m-%d');
var formatTime = d3.timeFormat('%b %Y');

var x = d3.scaleTime().range([0, width]),
		x2 = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]),
		y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
		xAxis2 = d3.axisBottom(x2),
		yAxis = d3.axisLeft(y);

// define line
var inflationLine = d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.index_val); })
  .curve(d3.curveBasis);

var brush = d3.brushX()
	.extent([[0, 0], [width, height2]])
	.on('brush', brushed);

var div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var svg1 = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom);

svg1.append('defs').append('clipPath')
	.attr('id', 'clip')
	.append('rect')
	.attr('width', width)
	.attr('height', height);

var focus = svg1.append('g')
	.attr('class', 'focus')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var context = svg1.append('g')
	.attr('class', 'context')
	.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

function makeLegend(start, num_series) {
  var d = ['Quarterly Index (CPI)', 'Daily Index (BPP)', 'Food CPI (BLS)', 'Housing CPI (BLS)', 'Energy CPI (BLS)'].slice(start, num_series)
  var r = ['#42c8f4','#f47941', '#6a8dd5','#a041f4','#50bf11'].slice(start, num_series)

  var legendSize = 200;
  var ordinal = d3.scaleOrdinal()
    .domain(d)
    .range(r);

  d3.select('.legend')
  var legend = d3.select('svg').append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate('+(1275 - legendSize) +','+ 2*margin.top +')');
  var legendOrdinal = d3.legendColor()
    .shape('path', d3.symbol().type(d3.symbolCircle).size(legendSize)())
    .shapePadding(10)
    .cellFilter(function(d) { return d.label !== 'e' })
    .scale(ordinal);

  legend.call(legendOrdinal);
}

d3.tsv('all_inflation.tsv', type, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([95, 115]);
  x2.domain(x.domain());
  y2.domain(y.domain());

	// append scatter plot to main chart area 
	var dots = focus.append('g');
		dots.attr('clip-path', 'url(#clip)');
		dots.selectAll('dot')
			.data(data)
			.enter().append('circle')
			.filter(function(d) { return d.cpi === '1' })
			.style('fill', '#42c8f4')
			.attr('class', 'dot')
			.attr('r', 4)
			.style('opacity', 1.0)
			.attr('cx', function(d) { return x(d.date); })
			.attr('cy', function(d) { return y(d.index_val); })
			.on('mouseover', function(d) {
				div.transition()
					.duration(200)
					.style('opacity', .9);
				div.html(formatTime(d.date) + '<br/>' + d.source + '<br/>' + d.index_val)
					.style('left', (d3.event.pageX) + 'px')
					.style('top', (d3.event.pageY - 28) + 'px');
			})
			.on('mouseout', function(d) {
				div.transition()
					.duration(500)
					.style('opacity', 0);
			});

		dots.selectAll('dot')
			.data(data)
			.enter().append('circle')
			.transition()
			.duration(1500)
			.filter(function(d) { return d.daily === '1' })
			.style('fill', '#f47941')
			.attr('class', 'dot')
			.attr('r', 1.5)
			.style('opacity', 0.9)
			.attr('cx', function(d) { return x(d.date); })
			.attr('cy', function(d) { return y(d.index_val); })
			// .on('mouseover', function(d) {
			// 	div.transition()
			// 		.duration(200)
			// 		.style('opacity', .9);
			// 	div.html(formatTime(d.date) + '<br/>' + d.index_val)
			// 		.style('left', (d3.event.pageX) + 'px')
			// 		.style('top', (d3.event.pageY - 28) + 'px');
			// })
			// .on('mouseout', function(d) {
			// 	div.transition()
			// 		.duration(500)
			// 		.style('opacity', 0);
			// });
        
	focus.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);

	focus.append('g')
		.attr('class', 'axis axis--y')
		.call(yAxis);
      
	focus.append('text')
		.attr('fill', '#000')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '0.71em')
		.attr('text-anchor', 'end')
		.text('Inflation Index');  
      
	svg1.append('text')             
		.attr('transform', 'translate(' + ((width + margin.right + margin.left)/2) + ' ,' + (height + margin.top + margin.bottom) + ')')
		.style('text-anchor', 'middle')
		.text('Drag From the Ends to Make a Selection');

	makeLegend(0,2);
      
	// append scatter plot to brush chart area      
	var dots = context.append('g');
		dots.attr('clip-path', 'url(#clip)');
		dots.selectAll('dot')
			.data(data)
			.enter().append('circle')
			.filter(function(d) { return d.cpi === '1' })
			.style('fill', '#42c8f4')
			.style('display', 'inline-block')
			.attr('class', 'dotContext')
			.attr('r', 2)
			.style('opacity', 1.0)
			.attr('cx', function(d) { return x2(d.date); })
			.attr('cy', function(d) { return y2(d.index_val); })

		dots.selectAll('dot')
			.data(data)
			.enter().append('circle')
			.filter(function(d) { return d.daily === '1' })
			.style('fill', '#f47941')
			.attr('class', 'dotContext')
			.attr('r', .75)
			.style('opacity', 0.5)
			.attr('cx', function(d) { return x2(d.date); })
			.attr('cy', function(d) { return y2(d.index_val); })
        
	context.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(0,' + height2 + ')')
		.call(xAxis2);

	context.append('g')
		.attr('class', 'brush')
		.call(brush)
		.call(brush.move, x.range());

});		

function brushed() {
  var selection = d3.event.selection;
  x.domain(selection.map(x2.invert, x2));
  focus.selectAll('.dot')
    .attr('cx', function(d) { return x(d.date); })
    .attr('cy', function(d) { return y(d.index_val); });
  focus.select('.axis--x').call(xAxis);
}

function type(d) {
  d.date = parseDate(d.date);
  d.index_val = +d.index_val;
  return d;
}

var svg2 = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.tsv('cpi_subset.tsv', function(error, data) {
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.index_val = +d.index_val;		
	});

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([d3.min(data, function(d) { return d.index_val; }), d3.max(data, function(d) { return d.index_val; })]);

  // nest data by inflation index
  var dataNest = d3.nest()
    .key(function(d) {return d.source; })
    .entries(data);

	// color scale
	var color = d3.scaleOrdinal(['#6a8dd5','#a041f4','#50bf11']);

	// spacing for the legend
	legendSpace = width / dataNest.length;

	// loop through each inflation index
	dataNest.forEach(function(d,i) { 
		svg2.append('path')
	    .attr('class', 'line')
	    // add colors
	    .style('stroke', function() { 
	        return d.color = color(d.key); })
	     // assign an ID
	    .attr('id', 'tag'+d.key.replace(/\s+/g, ''))
	    .attr('d', inflationLine(d.values));

      // add legend
      svg2.append('text')
        .attr('x', (legendSpace/2)+i*legendSpace)
        .attr('y', height + (margin.bottom/2)+ 5)
        .attr('class', 'legend')   
        .style('fill', function() { 
          return d.color = color(d.key); })
	      .on('click', function() {
          var active   = d.active ? false : true,
          newOpacity = active ? 0 : 1; 
          d3.select('#tag'+d.key.replace(/\s+/g, ''))
            .transition().duration(100) 
            .style('opacity', newOpacity); 
	        d.active = active;
	      })  
	      .text(d.key); 
    });

  // x axis
  svg2.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // x axis label
  svg2.append('text')             
		.attr('transform', 'translate(' + ((width + margin.right + margin.left)/2) + ' ,' + (height + margin.top + margin.bottom) + ')')
		.style('text-anchor', 'middle')
		.text('Click to Toggle Indexes or Mouseover to View Values');

  // y axis
  svg2.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));

  // y axis label
  svg2.append('text')
		.attr('fill', '#000')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '0.71em')
		.attr('text-anchor', 'end')
		.text('Inflation Index');

	var mouseG = svg2.append("g")
    .attr("class", "mouse-over-effects");

  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");
      
  var lines = document.getElementsByClassName('line');

  var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(data)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
      return color(d.name);
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text")
    .attr("transform", "translate(10,3)");

  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "0");
    })
    .on('mouseover', function() { // on mouse in show line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "1");
    })
    .on('mousemove', function() { // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line")
        .attr("d", function() {
          var d = "M" + mouse[0] + "," + height;
          d += " " + mouse[0] + "," + 0;
          return d;
        });

  d3.selectAll(".mouse-per-line")
    .attr("transform", function(d, i) {
      var xDate = x.invert(mouse[0]),
          bisect = d3.bisector(function(d) { return d.date; }).right;
          idx = bisect(d.index_val, xDate);
      
      var beginning = 0,
          end = lines[i].getTotalLength(),
          target = null;

      while (true){
        target = Math.floor((beginning + end) / 2);
        pos = lines[i].getPointAtLength(target);
        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
          break;
        }
        if (pos.x > mouse[0]) end = target;
        else if (pos.x < mouse[0]) beginning = target;
        else break; // position found
      }
      
      d3.select(this).select('text')
        .text(y.invert(pos.y).toFixed(2));
        
      return "translate(" + mouse[0] + "," + pos.y +")";
    });

  });

});


