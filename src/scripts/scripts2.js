(function(){
    
    //Date format as of input CSV
    var format = d3.time.format("%Y-%m-%d");
    
    //Append groomed variables on main object  
    function parser(d) {        
        d.pValue = +d.Value;
        d.pYearOnly = +d.Year;
        d.pDate = format.parse(d.Date);       
        return d; 
    } 
    
    //Compute DOY
    Date.prototype.dayOfYear= function(){
        var j1= new Date(this);
        j1.setMonth(0, 0);
        return Math.round((this-j1)/8.64e7);
    };
    
    //Plot main chart
    function plotMultiLineChart(chartData) {       
        var margin = {top: 30, right: 30, bottom: 75, left: 100};
        var width = 1000 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
        
        //xAxis interval
        var minDay = 1;
        var maxDaY = 366;
        
        //yAxix interval
        var yAxisMaxValue = 130;
        var yAxisMinValue = 40;
        
        //Axis ticks
        var xAxisTickNumber = 10;
        var yAxisTickNumber = 7;
        
        var x = d3.time.scale()
            .domain([minDay,maxDaY])
            .range([0, width]);
    
        var y = d3.scale.linear()
            .domain([yAxisMinValue,yAxisMaxValue])
            .range([height, 0]);    
        
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(xAxisTickNumber)
            .tickFormat("hi")
            .orient("bottom");
    
        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(yAxisTickNumber)
            .orient("left");
        
        //Group data sets by year
        var dataGroupByYear = d3.nest()
            .key(function(d){return d.pYearOnly;})
            .entries(chartData);
            
        // put the graph in the "miles" div
        var svg = d3.select("#graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        //Mouseover tip
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([120, 40])
            .html(function(d) {
                return "<strong>" + d.pDate +                   
                        " " + d.pValue + "</strong>";
                });
    
        svg.call(tip);       

        
        var line = d3.svg.line()
            .x(function(d) {
                return x(d.pDate.dayOfYear());
            } )
            .y(function(d) { return y(d.pValue); } ); 
           
        dataGroupByYear.forEach(function(d,i){
            svg.append("path")
            .attr("class", "line")
            .style("stroke", function() { 
                // Add the colours dynamically
                d.color = color(d.key);
                return d.color; })
            
            .attr("id", 'tag'+d.key.replace(/\s+/g, '')) // assign ID
            .attr("d",line(d.values));
        });
        
        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .style("stroke-dasharray", (5, 5))
            .call(yAxis);  
        
        //Show chart circles
        svg.selectAll(".dot")
            .data(chartData)
            .enter().append("circle")
            .attr('class', 'datapoint')
            .attr('cx', function(d) { return x(d.pDate.dayOfYear()); })
            .attr('cy', function(d) { return y(d.pValue); })
            .attr('r', 2.5)
            .attr('fill', 'black')
            .attr('stroke', function(d){
                // Add the colours dynamically
                d.color = color(d.pYearOnly);
                return d.color;
            })
            .attr('stroke-width', '3')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
               
    }
    
    // set the colour scale
    var color = d3.scale.category10();   
    
    // Read in .csv data and make graph
    d3.csv("assets/new_format_2015only.csv", parser,
        function(error, csvData) {
        
        //Remove NA entries    
        var cleanData = csvData.filter(function(row){
           if(row.Value !='NA'){
               return row.Value;
           }
           return false;
        });
       plotMultiLineChart(cleanData);
    }); 

})();