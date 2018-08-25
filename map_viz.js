/*
Inspired by denelius
https://github.com/denelius/foss4guk2018/blob/master/d3/6_d3_leaflet_USA.html

*/

var color_scale = ["#99d8c9", "#66c2a4","#41ae76","#238b45","#006d2c","#00441b"];
//["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"];

var colors = d3.scaleOrdinal().range(color_scale); //scaleLinear()

var prevElem;
    
var path,
    featureElement;

var map

var tooltip = d3.select("body")
                .append("div")
                .attr("class","tooltip");
                
var legend = d3.select("#legend")
					.append("svg")
					.attr("width",150)
					.attr("height",20);
    legend.selectAll("legendBlock")
		    .data(colors.range())
		    .enter()
		    .append('g')
		    .attr("class","legendBlock")
		    .append('rect')
		    .attr("x",(d,i) => { return 20*i + 20; })
		    .attr("y",0)
		    .attr("width",20)
		    .attr("height",20)
		    .style("fill", d=> {return d;})
		    
		    
//Function for processing data and and actions on the map  
function makeMyMaps(collection,lookup){			 
     addLmaps()
     drawFeatures(collection,lookup)    
};
    
 function addLmaps() {
	  var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
	  map = new L.Map("map", {center: [52.775, -1.4], zoom: 6})
				 .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
							    {minZoom: 5, maxZoom: 9, attribution: osmAttrib}
						    ));
			    
	 //Allow click on the map and get location
	 L.svg({clickable:true}).addTo(map);
  
 }
 
 function projectPoint(x, y) {
	  var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	  this.stream.point(point.x, point.y);
 }
 
 function drawFeatures(data,lookup) {
  
	  var svg = d3.select("#map")
		        .select("svg")
		        .attr("pointer-events", "auto")
		        .attr("pointer-events","visible")
	  
	  var g = svg.select("g")
	  
	  var transform = d3.geoTransform({point: projectPoint});
	  path = d3.geoPath().projection(transform);
	  
	  featureElement = g.selectAll("path")
	   .data(data.features)
	   .enter()
	   .append("path")
	      
	      .on("click", function(d){
	      	//save current position and fill area
	         if (prevElem)  {
				      prevElem.style("fill","");
		      }
		      prevElem = d3.select(this);
		      d3.select(this).style("fill","red");
		      
		      //Get LAD details
		      //let la
		      currLA = lookup.filter(l => {return l.CM_GEOGRAPHY_CODE == d.properties.cmlad11cd   } ); 
	         //alert(currLA[0].GEOGRAPHY_NAME)
	         		    	
		    	if (currLA.length > 0) {
			    	//Call update graphs with chosen LA
			    	geoCode = currLA[0].GEOGRAPHY_CODE;
			    	
			    	d3.select("#lad").text(currLA[0].GEOGRAPHY_NAME );
			    	
			    	/********** Update population graphs */
			    	let newData = filter_data(data_pop,geoCode,curYear);
			    	
			    	if (newData.length > 0) {
				    	redraw(newData);
			      }
			    	
			    	updateProj(data_proj,geoCode);
		    }
	      })
	      
	  map.on("moveend", L.bind(updateMap,null,lookup));
	  //MapClick.on('click', L.bind(onMapClick, null, ID))
	 
	  updateMap(lookup); //featureElement,path,
	  
	  
	  /*
	  //Get year value when move slider & update curYear variable   
	  d3.select("#year").on("input",function() {
	        curYear = +this.value;
	        
	        updateMap(lookup); //featureElement,path,
	  }); 
	  */
 
 }
 
 //featureElement,path,
 function updateMap(lookup) {
	  var mydata = lookup.filter(d => {return d.Year == curYear;});
	  
	  colors.domain(d3.extent(mydata, function(d) { return Math.round(d.Population/1000); })); //
	    
	  featureElement.attr("d", path)
	            .attr("fill",d=> {       
		    	      let c = mydata.filter(v => {
					    	      return v.CM_GEOGRAPHY_CODE == d.properties.cmlad11cd;
					    	      });
					    	      
					  if (c.length < 1) { return "#d9d9d9";  } //"#bdbdbd";
					  else {
					  	return colors(Math.round(c[0].Population/1000)); ///1000
					  }	       
	    	      
	    	    })
	    	    .on("mouseover", function(d){
		      	//show LAD name and population value
		      	let la = lookup.filter(l => {return l.CM_GEOGRAPHY_CODE == d.properties.cmlad11cd   } ),
		      	    tip;
		      	   
		      	if (la.length > 0 )   {  
			      	tooltip.transition()
					      	   .duration(200)
					      	   .style("opacity",.9);
			      	tip = la[0].GEOGRAPHY_NAME + "<br/>";
			      	tip = tip + "Population: " + la[0].Population;
			      	tooltip.html(tip)
			      	         .style("display","block")
					      	   .style("left", (d3.event.pageX) + "px")
					      	   .style("top", (d3.event.pageY - 28) + "px");
		      	
		      	}
		      	//alert(currLA[0].GEOGRAPHY_NAME);
		      }) 
		      .on("mouseout", function(d){
		      	//hide LAD name
		      	tooltip.transition()
				      	   .duration(200)
				      	   .style("opacity",0)
				      	   .style("display","none");
		      })    
  }  


