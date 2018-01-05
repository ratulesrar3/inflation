/* scatter.js
 * code for making scatterplots of
 * inflation data 
 */

 function plot1() {
	// svg space
	var margin = {top: 20, right: 20, bottom: 30, left: 20};
	var fullWidth = 1000;
	var fullHeigth = 800;
	var width = fullWidth - margin.right - margin.left;
	var height = var height = fullHeight - margin.top - margin.bottom;
	colors = ['#42c8f4','#f47941'];
	var parseTime = d3.timeParse("%Y-%m-%d");

	// define scales and setup axes
	var xScatterScale = d3.scaleTime()
		.rangeRound([0, width]);
	var yScatterScale = d3.scaleLinear()
		.rangeRound([height, 0]);
	var zScatterScale = d3.scaleOrdinal().range(colors);

	var xAxisScatter = d3.axisBottom()
		.scale(xScatterScale);
	var yAxisScatter = d3.axisLeft(yScatterScale);

	// define svg
	var svg = d3.select('#scatterplot')
		.append('svg')
		.attr('width', fullWidth)
		.attr('height', fullHeight);

	// defining g subspace to draw chart
  var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr('width', width)
		.attr('height', height);

	function scatter() {
		
	}

 } 