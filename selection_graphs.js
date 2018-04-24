// selection_graphs.js

// width and height are set by the render
var margin = {top: 20, right: 40, bottom: 40, left: 50};
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var parseTime = d3.timeParse("%Y-%m-%d");

// set lines to selected first, then change when removed
var selectAgg = true; 
var selectPs = true;
var selectFood = true;
var selectHousing = true;
var selectEnergy = true;
var allSelect = (selectAgg + selectPs + selectFood + selectHousing + selectEnergy);

var x = d3.scaleTime()
  .rangeRound([0, width]);
var y = d3.scaleLinear()
  .rangeRound([height, 0]);

var ValueLine = d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.index); });

// create line graph svg
var svg = d3.select("#linegraph") 
  .append('svg')
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom);

var g = svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function reselect() {
  return allSelect = (selectAgg + selectPs + selectFood + selectHousing + selectEnergy)
}

d3.json("./monthly_inflation.json", function(error, data) {
  dataset = data;

  dataset.forEach(function(d) {
    d.bls_agg = d.agg_cpi
    d.pricestats = +d.pricestats
    d.bls_food = +d.food
    d.bls_energy = +d.energy
    d.bls_housing = +d.housing
    d.bls_non_food_energy = +d.non_food_energy
    d.bls_non_housing = +d.non_housing
    d.date = parseTime(d.date);
  });

	if (error) {
		console.log(error);
	}
	else {
	drawLines();
  	}
});

function drawLines() {

x.domain(d3.extent(dataset, function(d) {return d.date}))
y.domain([0, d3.max(dataset, function(d) {return d.index;})])

// bring the data in on click of buttons (index value)
d3.select('#button-cpi')
  .on('click', function() {
    // lines
    g.append("path")
      .data([dataset])
      .attr("class", "agg-line")
      .attr("d", valueline);
    // points
    g.selectAll(".dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", function(d) {return x(d.date);})
      .attr("cy", function (d) {return y(d.bls_agg)}) 
      .attr("r", 3.5)
      .on('click', function(d) {console.log(d.date)});
      });


//make lines after click of button (with networth2)
d3.select('#button-cpi')
  .on('click', function() { 
    if (selectAgg == false) {
  	  selectAgg = true; 
      plot(dataset, "bls_agg", "agg-line", ".dot", "dot", "agg-label");
	} 
    else { 
      selectAgg = false;
      svg.selectAll(".dot").remove();
      svg.selectAll(".agg-line").remove();
      svg.select(".agg-label").remove();
    }
    reselect();
    makeLines()
  }); 

d3.select('#button-ps')
  .on('click', function() { 
    if (selectPs == false) {
  	  selectPs = true; 
      plot(dataset, "pricestats", "ps-line", ".dot", "dot", "ps-label");
	} 
    else { 
      selectPs = false;
      svg.selectAll(".dot").remove();
      svg.selectAll(".ps-line").remove();
      svg.select(".ps-label").remove();
    }
    reselect();
    makeLines()
  });

d3.select('#button-food')
  .on('click', function() { 
    if (selectFood == false) {
  	  selectFood = true; 
      plot(dataset, "bls_food", "food-line", ".dot", "dot", "food-label");
	} 
    else { 
      selectFood = false;
      svg.selectAll(".dot").remove();
      svg.selectAll(".food-line").remove();
      svg.select(".food-label").remove();
    }
    reselect();
    makeLines()
  });

d3.select('#button-housing')
  .on('click', function() { 
    if (selectHousing == false) {
  	  selectHousing = true; 
      plot(dataset, "bls_housing", "housing-line", ".dot", "dot", "housing-label");
	} 
    else { 
      selectHousing = false;
      svg.selectAll(".dot").remove();
      svg.selectAll(".housing-line").remove();
      svg.select(".housing-label").remove();
    }
    reselect();
    makeLines()
  });

d3.select('#button-energy')
  .on('click', function() { 
    if (selectEnergy == false) {
  	  selectEnergy = true; 
      plot(dataset, "bls_energy", "energy-line", ".dot", "dot", "energy-label");
	} 
    else { 
      selectEnergy = false;
      svg.selectAll(".dot").remove();
      svg.selectAll(".energy-line").remove();
      svg.select(".energy-label").remove();
    }
    reselect();
    makeLines()
  });

plot(dataset, "bls_agg", "agg-line", ".dot", "dot", "agg-label");
plot(dataset, "pricestats", "ps-line", ".dot", "dot", "ps-label");
plot(dataset, "bls_food", "food-line", ".dot", "dot", "food-label");
plot(dataset, "bls_housing", "housing-line", ".dot", "dot", "housing-label");
plot(dataset, "bls_energy", "energy-line", ".dot", "dot", "energy-label");

function plot(data, inflation_type, lineclass, dot, dotclass, label) {
  // filter
  data = dataset.filter(function(d) {return d.subject == inflation_type;})
  //console.log(data)

  //lines
  g.append("path")
    .data([data])
    .attr("class", lineclass)
    .attr("d", ValueLine);

  // points
  g.selectAll(dot)
    .data(data)
    .enter()
    .append("circle")
    .attr("class", dotclass)
    .attr("cx", function(d) {return x(d.year);})
    .attr("cy", function (d) {return y(d.index)})
    .attr("r", 5)
    .on("mouseover", function(d) {
      d3.select(this).attr('r', 8);
      d3.select(this).style("cursor", "pointer");
      tooltip.text(d.year.getFullYear() + d.index); 
      return tooltip.style("visibility", "visible");})
    .on("mousemove", function() {return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(d) {
      d3.select(this).attr('r', 5)
        return tooltip.style("visibility", "hidden");
      });

    // labels
    svg.append("text")
      .attr('transform', 'translate(' + (width + margin.left + 10) + ',' + (y(data[0].index) + margin.top) + ')')
      .text(inflation_type)
      .attr("class", label)
      .attr("font-family", "Avenir");

};  


// x axis
svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
  .call(d3.axisBottom(x)) 
  .selectAll("text")
  .attr("transform", "rotate(-30)")
  .attr("font-family", "Avenir")
  .attr("font-size", "10px");

// x axis text
svg.append("text")
  .attr('transform', 'translate(' + (width + margin.left + margin.right)/2 + ',' + (height + margin.top + 35) + ')')
  .style("text-anchor", "middle")
  .text("Year")
  .attr("font-family", "Avenir")
  .attr("font-size", "16px");

// y axis
svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .call(d3.axisLeft(y));

// y axis text 
svg.append("text")
  .attr('transform', 'translate('+ margin.left/3 + ',' + (height + margin.top + margin.bottom)/2 + ')rotate(-90)')
  .style("text-anchor", "middle")
  .text("Inflation Index Value")
  .attr("font-family", "Avenir")
  .attr("font-size", "16px");

// source text
svg.append("text")
  .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top + margin.bottom - 5) + ')')
  .text("Data Source: MIT Billion Prices Project, Bureau of Labor Statistics")
  .attr("font-family", "Avenir")
  .attr("font-size", "10.5px")

};

function makeLines() {

if ( totalselect !== 2) {
  d3.selectAll(".diffLines").remove();
  d3.selectAll(".diffText").remove();
};

if (totalselect == 2) { 

// get classes of dots
  var classes = [];
  d3.selectAll("circle")._groups[0].forEach(function (circle) {
    classes.push(circle.getAttribute("class"));})
  

  var list = classes.filter(function (x, i, a) {
    return a.indexOf(x) == i;
  });

  line1 = d3.selectAll("." + list[0])._groups[0]
  line2 = d3.selectAll("." + list[1])._groups[0]

  for (var i = 0; i < 7; i++) {
      point1 = line1[i]
      point2 = line2[i]

      g.append("line")
        .attr("class", "diffLines")
        .attr("x1", point1.getAttribute('cx'))
        .attr("y1", point1.getAttribute('cy'))
        .attr("x2", point2.getAttribute('cx'))
        .attr("y2", point2.getAttribute('cy'))
        .attr("stroke", "grey")
        .transition()
        .duration(5000)
        

      x1 = parseInt(point1.getAttribute('cx'))
      y1 = parseInt(point1.getAttribute('cy'))
      y2 = parseInt(point2.getAttribute('cy'))

      // label
      g.append("text")
        .attr("class", "diffText")
        .attr('transform', 'translate(' + (x1 + 5) + ',' + (y1 + y2)/2 + ')')
        .text((Math.round(point1.__data__.amount/point2.__data__.amount).toString() + "X"))
        .attr("font-size", 10)
        .attr("font-family", "Avenir");

  }
}
};
/*
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
*/

