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
    
    //Plot main chart
    function plotMultiLineChart(chartData) {   
            
        var margin = {top: 30, right: 30, bottom: 75, left: 100};
        var width = 700 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
        
        //xAxis interval
        var minDay = 1;
        var maxDaY = 365;
        
        //yAxix interval
        var yAxisMaxValue = 130;
        var yAxisMinValue = 40;
        
        //Axis ticks
        var xAxisTickNumber = 20;
        var yAxisTickNumber = 7;
        
        var x = d3.scale.linear()
            .domain([minDay,maxDaY])
            .range([0, width]);
    
        var y = d3.scale.linear()
            .domain([yAxisMinValue,yAxisMaxValue]).nice()
            .range([height, 0]);    
        
        var xAxisLabels = generateXAxisLables();
        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(xAxisTickNumber)
            .tickFormat(function(d){  
                 return(xAxisLabels[d]);            
               })
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
            .offset([70, 40])
            .html(function(d) {
                return "Date: "+ d.pDate.getFullYear() +"-"+ (parseInt(d.pDate.getMonth())+1) +"-"+ d.pDate.getDate() +                   
                        "<br/>"+ "Value: "+ d.pValue +" %" ;
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
                
                .attr("id", 'line_'+d.key.replace(/\s+/g, '')) // assign ID
                .attr("d",line(d.values));
            
            //Add legend
            var lWidth = width-30;
            var lSpace = 20;
            svg.append("text")
                .attr("x", lWidth)
                .attr("y", (lSpace / 2) + i * lSpace)
                .style("fill", function(){
                    return color(d.key);
                })
                .attr("class", "legend")
                .text(d.key)
                .on('click',function(){
                    //Toggle chart
                   var active = d.active ? false : true;
                   var opacity = active ? 0 : 1;                
                   d3.select("#line_" + d.key).style("opacity", opacity); 
                   d3.selectAll(".circle_" + d.key).style("opacity", opacity);               
                   d.active = active;
                });
        });
        
        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickSize(-height, 0, 0))
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.5em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-55)" );
            
        svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .text("Actual values");
        
        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            //.style("stroke-dasharray", (5, 5))
            .call(yAxis.tickSize(-width, 0, 0));  
            
        svg.append("text")
            .attr("class", "ylabel")
            .attr("y", 30 - margin.left) // x and y switched due to rotation!!
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Percent");
        
        //Show chart circles
        svg.selectAll(".dot")
            .data(chartData)
            .enter().append("circle")
            .attr('class',function(d){
                return 'datapoint circle_'+d.pYearOnly;
            })
            .attr('cx', function(d) { return x(d.pDate.dayOfYear()); })
            .attr('cy', function(d) { return y(d.pValue); })
            .attr('r', 3)
            .attr('fill', 'black')
            .attr('stroke', function(d){
                // Add the colours dynamically
                d.color = color(d.pYearOnly);
                return d.color;
            })
            .attr('stroke-width', '3')
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
            
        //Graph title
        svg.append("text")
            .attr("class", "graphtitle")
            .attr("y", 0)
            .attr("x", width/2)
            .style("text-anchor", "middle")
            .text("Nutters Ridge - Juniper, Utah");               
    }
    
    // set the colour scale
    var color = d3.scale.ordinal()
                .range(colorbrewer.Set1[9]);  
    
    // Read in .csv data and make graph
    d3.csv("assets/all_years_formatted2.csv", parser,
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