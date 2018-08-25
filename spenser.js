//Asynchronously loading data files: data, GeoJSON data and lookup table
d3.queue()
  .defer(d3.json,"/data/topo/EnglandWales.json")
  .defer(d3.csv,"/data/LADpopulations.csv")
  .defer(d3.csv,'/data/pop_years_rangeAges.csv')
  .defer(d3.csv,'/data/projections.csv')
  .await(main_viz);

/*********** Global variables ***********/
var curYear = d3.select("#year").property("value");
var currLA,
    geoCode = 'E92000001', //England
    data_pop,
    data_proj,
    lad;
    

/************** Mapping *************/

/************* Pyramid ************************/

/************* Projection ************************/

/***************   Functions   ***********************************/

/*
Main function of Spenser visulisation module  
Function: 
   main_viz - Main function. Call all graph function passing data to them
   
Parameters:
	error - Catch error and throw it
	collection - GeoJSON data (boundaries)
	lookup - table with code and names of administrative entities 
	data - simulated population (counts) data
	proj - projection variants data
*/    
function main_viz(error,collection,lookup,data,proj){
  if (error) throw error;
  
  //Call pyramid main function
  data_pop = data;
  pyramid (data_pop);
      
  //Call map main function
  lad=lookup;
  makeMyMaps(collection,lad);
    
  //Call projection main function
  data_proj = proj;
  projection(data_proj);
  
}

//Get Year value and update map and pyramid	
d3.select("#year").on("input",function() {
        curYear = +this.value;
        
        //adjust text on the range slider
	     d3.select("#slider_value").text(curYear);
	     d3.select("#slider_value").property("value",curYear);
        
        updateMap(lad); //featureElement,path,
        redraw(filter_data(data_pop,geoCode,curYear))
 }); 
  
  //from pyramid
 //d3.select("#year").on("input",function() {redraw(filter_data(data,geoCode,+this.value))});  

