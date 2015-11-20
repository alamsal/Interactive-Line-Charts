(function(){
    var format = d3.time.format("%d-%b");
    
	function parser(d) {
        d.pDate = format.parse(d.Date);
        return d;
    }  
    
    //Create formatted X-axis labels
    var generateXAxisLables = function(){
        var formattedLabel = [];    
        for(var day=1;day<366;++day){
            var momentDate = Date.fromDayOfYear(day);
            var label = pad(momentDate.getMonth() + 1)+"-"+pad(momentDate.getDate());
            formattedLabel.push(label);    
        }
        return formattedLabel;
    };
     

	function plotBiMonthlyData(chartData,dirtyData){
		       
        var margin = {top: 30, right: 30, bottom: 75, left: 100};
        var width = 700 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
        
        //xAxis interval
        var minDay = 1;
        var maxDaY = 365;
        
        //yAxix interval
        var yAxisMaxValue = 300;
        var yAxisMinValue = 40;
        
        //Axis ticks
        var xAxisTickNumber = 12;
        var yAxisTickNumber = 7;
        
        var x = d3.time.scale()
            .domain([format.parse(dirtyData[0].Date),format.parse(dirtyData[dirtyData.length-1].Date)])
            .range([0, width]);
    
        var y = d3.scale.linear()
            .domain([yAxisMinValue,yAxisMaxValue]).nice()
            .range([height, 0]);    
        
        var xAxisLabels = generateXAxisLables();
        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(12)
            .tickSize(-height, 0, 0)
            
            //.tickFormat(function(d){ return(xAxisLabels[d]);})
            .orient("bottom");
    
        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(-width, 0, 0)
            
            .ticks(yAxisTickNumber)
            .orient("left");
        
            
        // put the graph in the "miles" div
        var svg = d3.select("#bi-monthly-graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        //Mouseover tip
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([70, 40])
            .html(function(d) {
                return "Date: "+pad(parseInt(d.pDate.getMonth())+1) +"-"+pad(d.pDate.getDate()) +                   
                        "<br/>"+ "Value: "+ d.Value +" %" ;
                });
    
        svg.call(tip);       

        
        var line = d3.svg.line()
            .x(function(d) {
                return x(d.pDate);
            } )
            .y(function(d) { return y(d.Value); } ); 
    
    
        // add the x axis and x-label
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("class","mycolor")
                .attr("dx", "-.5em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-55)" );
        
        svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .text("Month in 2013");
    
        // add the y axis and y-label
        svg.append("g")
        .attr("class", "grid mycolor")
        .attr("transform", "translate(0,0)")
        .call(yAxis);
        
        svg.append("text")
            .attr("class", "ylabel")
            .attr("y", 0 - margin.left) // x and y switched due to rotation!!
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Odometer reading (mi)");
    
        svg.append("text")
        .attr("class", "graphtitle")
        .attr("y", 10)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .text("MILES OVER TIME");
    
        // draw the line
        svg.append("path")
        .attr("d", line(chartData));
    
        svg.selectAll(".dot")
        .data(chartData)
        .enter().append("circle")
        .attr('class', 'datapoint')
        //.attr('cx', function(d) { return x(d.pDate.dayOfYear()); })
        .attr('cx', function(d) { return x(d.pDate); })
        .attr('cy', function(d) { return y(d.Value); })
        .attr('r', 6)
        .attr('fill', 'white')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '3')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);    
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
	}
	
  
	// Read in .csv data and make graph
    d3.csv("assets/BiMonthly.csv", parser,
        function(error, csvData) {     
    
        //Remove NA entries    
        var cleanData = csvData.filter(function(row){
           if(row.Value !='NA'){
               return row.Value;
           }
           return false;
        });
        
        plotBiMonthlyData(cleanData,csvData);
       
    }); 
})();