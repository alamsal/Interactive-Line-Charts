(function(){
    
    // plot a graph of miles vs. time

    function parser(d) {
        var format = d3.time.format("%Y-%m-%d");
        d.pValue = +d.Value;
        //d.pDate = format.parse(d.Date);
        d.pDate = new Date(d.Date);
        return d; 
    }
    
    
    
    function milesovertime(csvdata) {
        var margin = {top: 30, right: 30, bottom: 75, left: 100};
        var width = 500 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
    
        var minDate = csvdata[0].pDate;
        var maxDate = csvdata[csvdata.length - 1].pDate;
        
        // Set up time based x axis
        var x = d3.time.scale()
        .domain([minDate, maxDate])
        .range([0, width]);
    
        var y = d3.scale.linear()
        .domain([0, 150])
        .range([height, 0]);
    
        var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(10)
        .orient("bottom");
    
        var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(7)
        .orient("left");
    
        // put the graph in the "miles" div
        var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        // function to draw the line
        var line = d3.svg.line()
        .x(function(d) { return x(d.pDate); } )
        .y(function(d) { return y(d.pValue); } );    
    
        //Mouseover tip
        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([120, 40])
        .html(function(d) {
            return "<strong>" + d.pDate +                   
                    " " + d.pValue + "</strong>";
             });
    
        svg.call(tip);
    
        // add the x axis and x-label
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 9)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");
        svg.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .text("Month in 2013");
    
        // add the y axis and y-label
        svg.append("g")
        .attr("class", "y axis")
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
        .attr("d", line(csvdata));
    
        svg.selectAll(".dot")
        .data(csvdata)
        .enter().append("circle")
        .attr('class', 'datapoint')
        .attr('cx', function(d) { return x(d.pDate); })
        .attr('cy', function(d) { return y(d.pValue); })
        .attr('r', 6)
        .attr('fill', 'white')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '3')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    }
    // Read in .csv data and make graph
    d3.csv("assets/nuttersridge_formatted.csv", parser,
        function(error, csvData) {
            
        var cleanData = csvData.filter(function(row){
           if(row.Value !='NA'){
               return row.Value;
           }
           return false;
        });
       milesovertime(cleanData);
    }); 

})();

