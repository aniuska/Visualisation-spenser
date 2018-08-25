/*
Inspired by Harry Stevens
https://bl.ocks.org/HarryStevens/3d001d5e7ac8ea1eedc56bda01189008

*/

/* Setting variables */
var margin = {top: 20, bottom: 24, left: 20, right: 20, middle:28},
 w = 400,
 h = 200,
 width = w - margin.left - margin.right,
 height = h - margin.top - margin.bottom,
 regionWidth = w/2 - margin.middle;
 	    
var svg = d3.select("#pyramid").append("svg")
		      .attr("width", width + margin.left + margin.right)
		      .attr("height", height + margin.top + margin.bottom)
	         .append("g")
		         .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		         
var t = d3.transition().duration(750),
//xScale = d3.scaleLinear().range([0,regionWidth]),
xScale = d3.scaleLinear().range([0,100]),
x_scale_male = d3.scaleLinear().range([0, regionWidth]),
x_scale_female = d3.scaleLinear().range([regionWidth,0,]),
y_scale = d3.scaleBand()
	.rangeRound([0,height])
	.padding(.1);
	
var commas = d3.format(",.0f");

var fCounts,mCounts;
var maleBarGroup,wholeBarGroup,femaleBarGroup	

/* REMOVE START
EthText is a temporal variable to get the pyramid work for all LAD. 
Remove it when have real data for each LAD 
*/
var EthText = ["","BAN","BLA","BLC","CHI", "IND", "MIX","OAS","OBL","OTH","PAK","WBI","WHO"]; 

/*** REMOVE END */

/* Variable used for order pyramid labels - get order index*/
var age_range_order = ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39","40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"];

/*	   
Function:
   pyramid - draw bars to create pyramid graph. Also define combobox for Ethnicity
Parameters:
   data: population counts by age, sex & ethnicity
*/ 
function pyramid (data) {

  //parsing data
  data.forEach(function(d) {
  	                
  						 d.F = +d.F;
  						 d.M = +d.M;
  						 d.Sort_Ix = age_range_order.indexOf(d.Age_Range);
  						 d.per_F = 100;
  						 d.per_M = 100;
  });
  
  filteredData = filter_data(data, geoCode,curYear);
  
  // defining y domain
  y_scale.domain(filteredData.sort((a,b)=>{return b.Sort_Ix - a.Sort_Ix})
									  .map(function(d){ return d.Age_Range; }));
									  
  /*************** Pyramid Graph Labels *******************************/
	var labels = svg.append('g')
	                .attr('transform', "translate(" + regionWidth + ", 0)");
	 /* female label */
	 labels.append("text")
	  .attr("class", "label")
	  .text('Female')
	  .attr("x", w/2- regionWidth - 34)
	  .attr("y", margin.top - 18)
	  .attr("text-anchor", "end");
	
	 /* male label */
	 labels.append("text")
	  .attr("class", "label")
	  .text('Male')
	  .attr("x", w/2- regionWidth + 34)
	  .attr("y", margin.top - 18)
	  //.attr('transform', "translate(" + (w - regionWidth) + ", 0)" );
	  
	 /* ageAxis label */
	 labels.append("text")
	  .attr("class", "label")
	  .text("Age Range")
	  .attr("x", w/2- regionWidth + 28)
	  .attr("y", margin.top - 18 )
	  .attr("text-anchor", "end");
	
	/* sharedLabels Axis */   
	var yAxis  = d3.axisRight(y_scale)
	               .tickPadding(margin.middle-4)
	               .tickSize(0)
	             
	 svg.append("g")
	  .attr("class", "axis")
	  .attr('transform', "translate(" + (regionWidth +2)+ ", 0)")
	  .call(yAxis)
	  .selectAll('text')
	  .attr("text-anchor", "middle")
  
  /********************* Creating dropdowns **************************/ 
  //Grouping  by Eth to get Ethnicity value
  /* Remove comment symbols when have real data for all LADs
  var nestData = d3.nest()
						   .key(d => d.Ethnicity)
						   .rollup(v=> v.length)
						   .entries(data);
    
  selectData = nestData.map(k => k.key);
  */
  
  /* REMOVE START
  This line is temporal. Remove when have real data for all LADs */
  selectData = EthText
  /* REMOVE END */
  
  /*********************/
  selectData.splice(0,1,"All"); //Add option "All" for counts all eth
    
  // Create combobox for Ethnicity
  var filters = d3.select('#filter')
  var span = filters.append('span')
    .text('Select Ethnicity ')
  var yInput = filters.append('select')
      .attr('id','xSelect')
      .on('change',function() {
      	            redraw(filterByEth(data, this.value,curYear) )
                   }) //call function when values change OJO change for redraw function
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d })
      .text(function (d) { return (d == "All")? d + " Ethnicity" : d;})
  filters.style("display","none"); //Change none by block when have real dat for all LADs
  
  /*********************** Define bars groups *********************/
  maleBarGroup = svg.append('g')
			  .attr('transform', "translate(" + (w - regionWidth) + ", 0)" );
			                     
	femaleBarGroup = svg.append('g')
		  .attr('transform', "translate(" + regionWidth + ", 0)" + "scale(-1,1)");//+ 'scale(-1,1)'
		  
	wholeBarGroup = svg.append('g')
	.attr('transform', "translate(0, 0)" );
  
  //Draw default pyramid - for England
  redraw(filteredData);
  
}

/*
Filter the data to update the pyramid population

Parameters:
data: data to filter
geo: filter by LAD code 
year: filter by Year 
*/
function filter_data(data, geo, year){
	
	//Filter data by geoCode and year
   var mydata = data.filter(d => {return d.Year == year && d.GEOGRAPHY_CODE == geoCode;});
        
   return mydata;
}

/*
Filter the data by ethnicity to update the pyramid population 

Parameters:
data: data to filter 
value: filter by Ethnicity value or All. Calculate total counts for All 
year: filter by Year 

*/
function filterByEth(data, value, year){
	
	data = filter_data(data, geoCode, year);
		
   if (value === "All") {
   	  //Aggregate by age range
		  //At the moment only for Tower Hamlets
		   var total_byAge = d3.nest()
								   .key(d => d.Age_Range)
								   .sortKeys(d3.descending)
								   .rollup(function(v) { return {
								   	            //"length": v.length,
								   					"F": d3.sum(v,function(d) {return d.F}), 
								   					"M": d3.sum(v,function(d) {return d.M}),
								   		}})
								   .entries(data);	
					   
            
        var totals = total_byAge.map(obj => {
  							var row = {};
  							row['Age_Range'] = obj.key;
  							row['F'] = obj.value.F;
  							row['M'] = obj.value.M;
  							row['per_F'] = obj.value.per_F;
  							row['per_M'] = obj.value.per_M;
  							return row;
  						});
  						
  	      return totals;
   } else {
		   return data.filter(d => { return d.Ethnicity == value;});
   
	}
}


function update_elem(age, fc,mc) {		
	d3.select("#cage").text(age );
	if (age === "All") {               
		//show female count
		d3.select("#cFemale").text (fc);
		//show male count
	   d3.select("#cMale").text(mc);
   } else {
   	//show female count
		d3.select("#cFemale").text (fc + "% ");
		//show male count
	   d3.select("#cMale").text(mc + "% ");
	}
}

function redraw(data){	
   
   if (data.length < 1 ) {return;}
      
   // sort data by age
	data=data.sort((a,b)=>{return b.Sort_Ix - a.Sort_Ix});
	
	/*Calculate percentage */
   
   var tot_F = d3.sum(data, d=> {return d.F}),
       tot_M = d3.sum(data, d=> {return d.M});

   data.forEach(d=> {
  						 d.per_F = d.F/tot_F * 100;
  						 d.per_M = d.M/tot_M * 100;
	  });
   
   
   var filters = d3.select('#filter')	
   
   /* To REMOVE START*/
   if (geoCode == "E09000030" ) {	
      filters.style("display","block");
   } else {
      filters.style("display","none");
   }
	/* To REMOVE END*/
	
	/****************************/			
	fCounts = data.map(function(d){ return d.F; })
              .reduce((sum,c) =>{ return sum + c;});
                    
	mCounts = data.map(function(d){ return d.M; })
	              .reduce((sum,c) =>{ return sum + c;});
	                           
	update_elem("All", fCounts,mCounts);
	
	// update x scales
	var max_male = d3.max(data, function(d){ return d["per_M"]; }),
		 max_female = d3.max(data, function(d){ return d["per_F"]; });
		
	x_scale_male.domain([0, d3.max([max_male, max_female])]).nice();
	x_scale_female.domain([0, d3.max([max_male, max_female])]).nice();
	xScale.domain([0,d3.max([max_male, max_female])]).nice();
				
	// MAKE GROUPS FOR EACH SIDE OF CHART
		
	//sort data by age range
	data = data.sort(function(a,b) { return d3.descending(a.Age_Range,b.Age_Range);});
		
	// JOIN
	var male_bar = maleBarGroup.selectAll(".bar.male") //svg.selectAll(".bar.male")
			.data(data, function(d){ return d.Age_Range; });

	var female_bar = femaleBarGroup.selectAll(".bar.female") //svg.selectAll(".bar.female")
			.data(data, function(d){ return d.Age_Range; });
			
	var whole_bar = wholeBarGroup.selectAll(".bar.shared")
	     .data(data, function(d){ return d.Age_Range; });                        
	
	// EXIT
	male_bar.exit().remove();
   female_bar.exit().remove();
   whole_bar.exit().remove();
	
	// UPDATE
	male_bar
		.transition(t)
			.attr("width", function(d){ return xScale(d["per_M"]); });

	female_bar
		.transition(t)
			.attr("x",0)
			.attr("width", function(d){ return xScale(d["per_F"]); });
			
	whole_bar.transition(t)
	      .attr("x",0)
			.attr("width", width);
			//.attr("width", function(d){ return width - xScale(d["F"]) - xScale(d["M"]); });

	// ENTER
	male_bar.enter().append("rect")
			.attr("class", "bar male")
			.attr("x", 0)
			.attr("y", function(d){ return y_scale(d.Age_Range); })
			.attr("width", function(d){ return xScale(d["per_M"]) ; })
			.attr("height", y_scale.bandwidth())
			.attr("fill", "#b3ccff");

	female_bar.enter().append("rect")
			.attr("class", "bar female")
			.attr("x", 0)
			.attr("y", function(d){ return y_scale(d.Age_Range); })
			.attr("width", function(d){ return xScale(d[ "per_F"]) ; })
			.attr("height", y_scale.bandwidth())
			.attr("fill", "#ffcce0")
			
	whole_bar.enter().append("rect")
	             .attr("class", "wholebar")
					 .attr("x", 0)
					 .attr("y", function(d) { return y_scale(d.Age_Range) ; })
				    .attr("width", width + margin.middle)
				    .attr("height", y_scale.bandwidth()) 
				    .attr("fill", "none")
				    .attr("pointer-events", "all");
			    	
	/*whole_bar*/
	d3.selectAll("rect.wholebar")		   
				.on("mouseover", function(d,i) {
						//show highlight
						d3.select(this).attr("class", "highlight wholebar")
												
		            //update_elem(d.Age_Range, commas(d.F),commas(d.M));
		            update_elem(d.Age_Range, commas(d.per_F),commas(d.per_M));
					})
			   .on("mouseout", function(d,i) {
						//show highlight
						d3.select(this).attr("class", "wholebar")
						
						wholeBarGroup.selectAll("text.hover").remove();
						               
						update_elem("All", fCounts,mCounts);
					});	
						   
}






