// scatterbrush.js

// scatter plot and brush adapted from Raj Vanisa & Mike Bostock
// http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
// https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

// tooltip from d3noob
// https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73

// makeLegend function using d3-legend adapted from Mark Vandergon
// https://github.com/mdvandergon/monetary-policy/blob/master/graph.js

function makeLegend(start, num_series) {
  var d = ["Quarterly Index (CPI)", "Daily Index (BPP)", "Food CPI (BLS)", "Housing CPI (BLS)", "Energy CPI (BLS)"].slice(start, num_series)
  var r = ['#42c8f4','#f47941', '#6a8dd5','#a041f4','#50bf11'].slice(start, num_series)

  var legendSize = 200;
  var ordinal = d3.scaleOrdinal()
    .domain(d)
    .range(r);

  d3.select('.legend')
  var legend = d3.select('svg').append("g")
    .attr("class", "legend")
    .attr("transform", "translate("+(1025 - legendSize) +","+ 2*margin.top +")");
  var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(legendSize)())
    .shapePadding(10)
    .cellFilter(function(d) { return d.label !== "e" })
    .scale(ordinal);

  legend.call(legendOrdinal);
}

// define svg space
var margin = {top: 20, right: 20, bottom: 110, left: 50},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.timeParse('%Y-%m-%d');
var formatTime = d3.timeFormat('%e %B');

var x = d3.scaleTime().range([0, width]),
		x2 = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]),
		y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
		xAxis2 = d3.axisBottom(x2),
		yAxis = d3.axisLeft(y);

var brush = d3.brushX()
	.extent([[0, 0], [width, height2]])
	.on('brush', brushed);

var div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var svg = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom);

svg.append('defs').append('clipPath')
	.attr('id', 'clip')
	.append('rect')
	.attr('width', width)
	.attr('height', height);

var focus = svg.append('g')
	.attr('class', 'focus')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var context = svg.append('g')
	.attr('class', 'context')
	.attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

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
      
	svg.append('text')             
		.attr('transform', 'translate(' + ((width + margin.right + margin.left)/2) + ' ,' + (height + margin.top + margin.bottom) + ')')
		.style('text-anchor', 'middle')
		.text('Date');

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