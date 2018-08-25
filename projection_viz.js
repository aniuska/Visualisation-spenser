/*
Pojection graph

inspared by https://bl.ocks.org/d3noob


*/

// set the lines colour array
var color = d3.scaleOrdinal(d3.schemeCategory10);
var x,
    y,
    projline;

// Parse the date / time
var parseDate = d3.timeParse("%Y");	
 
/*
Function: 
   projection - Draw projection graph
   
Parameters: 
   data - projection variants data
*/
function projection(data){
   
   // Parse the data
	 data.forEach(function(d) {
		d.year = parseDate(d.PROJECTED_YEAR_NAME);
		d.count = +d.OBS_VALUE/1000;
	 });
	//filter by GEOGRAPHY_CODE
	var data_LAD = data.filter(l => {return l.GEOGRAPHY_CODE == geoCode   })
	
	// Nest the entries by VARIANT
	var dataNest = d3.nest()
	     .key(function(d) {return d.VARIANT;})
	     .entries(data_LAD);
	     													
   // Set the dimensions of the canvas / graph
	var margin = {top: 20, right: 50, bottom: 70, left: 80},
	    width = 330 - margin.left - margin.right,
	    height = 300 - margin.top - margin.bottom;
	
	// Set the ranges for x & y
	x = d3.scaleTime().range([0, width]);  
	y = d3.scaleLinear().range([height, 0]);
	
	// Define the line
	projline = d3.line()	
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.count); });
	    
	// Adds the svg canvas
	var svg = d3.select("#projection")
	    .append("svg")
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	        .attr("id", "svg_proj")
	    .append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	 // Scale the range of the data
	 x.domain(d3.extent(data_LAD, function(d) { return d.year; }));
	 y.domain([d3.min(data_LAD, function(d) { return d.count; }), d3.max(data_LAD, function(d) { return d.count; })]);
    		
	 // Loop through each VARIANT / key
	 dataNest.forEach(function(d,i) { 
	     svg.append("path")
	         .attr("class", "line")
	         .style("stroke", function() { // Add the colours dynamically
	             return d.color = color(d.key); })
	         .attr("d", projline(d.values));
	
	     // Add the Legend
	     svg.append("text")
	         .attr("x", width )  // space legend
	         .attr("y", height/2 + 20*i +20)
	         .attr("class", "legend_proj")    // style the legend
	         .style("fill", function() { // Add the colours dynamically
	             return d.color = color(d.key); })
	         .text(d.key); 
	
	 });
	
	  // Add the X Axis
	  svg.append("g")
	   .attr("class", "x axis_proj")
	   .attr("transform", "translate(0," + height + ")")
	   .call(d3.axisBottom(x));
	
	  // Add the Y Axis
	  svg.append("g")
	   .attr("class", "y axis_proj")
	   .call(d3.axisLeft(y));
	   
	  //Add axis label
	  svg.append("text")
	         .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom/2 ) + ")")  // space legend
	         .attr("text-anchor", "middle")
	         .text("Years"); 
	         
	  svg.append("text")
	         .attr("transform", "rotate(-90)")  
	         .attr("x", 0 - (height/2))
	         .attr("y", 0 - margin.left + 15 )
	         .attr("dy", "1em")    
	         .style("text-anchor","middle" )
	         .text("Persons"); 
   
}

/* 
Function: 
   updateProj - Filter original data per a specified LA code
   
Parameters: 
   geo - geo Code value to filter by
   data - original projection data
*/
function updateProj(data,geo) {
		
   // Parse the data
	 data.forEach(function(d) {
		d.year = parseDate(d.PROJECTED_YEAR_NAME);
		d.count = +d.OBS_VALUE/1000;
	 });
	 
	//Filter the data by geo Code
	var newData = data.filter(l => {return l.GEOGRAPHY_CODE == geo   });
			
	if (newData.length > 0) {
		// Nest the entries by VARIANT
		var dataLines = d3.nest()
		     .key(function(d) {return d.VARIANT;})
		     .entries(newData);
		
		//Select the section that changes will be applied
		var svg = d3.select("#projection");
		
		//scale the range of new data
	   x.domain(d3.extent(newData, function(d) { return d.year; }));
		//y.domain([d3.min(newData, function(d) { return d.count; }), d3.max(newData, function(d) { return d.count; })]);
		y.domain(d3.extent(newData, function(d) { return d.count; }));
		
		//Select all lines
		svg.selectAll(".line")
		              .data(dataLines)
		              .transition()
		              .duration(750)
					     .attr("d",d=> { return projline(d.values)});
			   
	   svg.select("g.y.axis_proj") //change the y axis
	            .transition()
				   .duration(750)
				   .call(d3.axisLeft(y));
		
  }
	
}