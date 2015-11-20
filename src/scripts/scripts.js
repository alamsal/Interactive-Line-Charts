(function(){
        
    var plotOptions = {
        csvPath:'assets/all_years_formatted2.csv',
        width:900,
        height:300,
        plotXaxisDescription:"Actual Values",
        plotYaxixDescription:"Percent",
        plotTitleDescription:"Nutters Ridge - Juniper, Utah",
        plotSubtitleDescription: "Multi year time series (Click on legend to toggle)",
        plotYaxisRangeMin:20,
        plotYaxixRangeMax:160,
        legendFromRight:50,
        legendSpacing:20          
    };  
    
    
    var multiyearActualData = new PlotMultiYearActualData(plotOptions);
    multiyearActualData.plotChart();
    
    function PlotMultiYearActualData(plotOptions){
        
        this.plotChart = plotInteractiveChart;

        
         function plotInteractiveChart (){
             
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
                for(var day=1;day<365;++day){
                    var momentDate = Date.fromDayOfYear(day);
                    var label = pad(momentDate.getMonth() + 1)+"-"+pad(momentDate.getDate());
                    formattedLabel.push(label);    
                }
                return formattedLabel;
            };
            
            //Plot main chart
            function plotMultiLineChart(chartData) {   
                    
                var margin = {top: 100, right: 20, bottom: 70, left: 100};
                                
                //xAxis interval
                var minDay = 1;
                var maxDaY = 365;
                
                //yAxix interval
                var yAxisMaxValue = plotOptions.plotYaxixRangeMax;
                var yAxisMinValue = plotOptions.plotYaxisRangeMin;
                
                //Axis ticks
                var xAxisTickNumber = 20;
                var yAxisTickNumber = 7;
                
                var x = d3.scale.linear()
                    .domain([minDay,maxDaY]).nice()
                    .range([0, plotOptions.width]);
            
                var y = d3.scale.linear()
                    .domain([yAxisMinValue,yAxisMaxValue])
                    .range([plotOptions.height, 0]);    
                
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
                    .attr("width", plotOptions.width + margin.left + margin.right)
                    .attr("height", plotOptions.height + margin.top + margin.bottom)
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
                    var lWidth = plotOptions.width - plotOptions.legendFromRight ;
                    var lSpace = plotOptions.legendSpacing;
                    svg.append("text")
                        .attr("x", lWidth)
                        .attr("y", (lSpace) + i * lSpace)
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
                        })
                        
                        .on("mouseover", function () {
                            d3.select("#line_" + d.key).style("stroke-width", 8);
                            d3.selectAll(".circle_" + d.key).style("stroke-width", 8);
                        })
                        .on("mouseout",function(){
                            d3.select("#line_" + d.key).style("stroke-width", 4);
                            d3.selectAll(".circle_" + d.key).style("stroke-width", 4);
                        });               
                        
                });
                
                // Add the X Axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + plotOptions.height + ")")
                    .call(xAxis.tickSize(-plotOptions.height, 0, 0))
                    .selectAll("text")  
                        .style("text-anchor", "end")
                        .attr("dx", "-.5em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-55)" );
                    
                svg.append("text")
                    .attr("class", "xlabel")
                    .attr("text-anchor", "middle")
                    .attr("x", plotOptions.width / 2)
                    .attr("y", plotOptions.height + margin.bottom)
                    .text(plotOptions.plotXaxisDescription);
                
                // Add the Y Axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis.tickSize(-plotOptions.width, 0, 0));  
                    
                svg.append("text")
                    .attr("class", "ylabel")
                    .attr("y", 30 - margin.left) // x and y switched due to rotation!!
                    .attr("x", 0 - (plotOptions.height / 2))
                    .attr("dy", "1em")
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "middle")
                    .text(plotOptions.plotYaxixDescription);
                
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
                    .attr("y", -40)
                    .attr("x", plotOptions.width/2)
                    .style("text-anchor", "middle")
                    .text(plotOptions.plotTitleDescription);
               
               svg.append("text")
                    .attr("class", "graph-sub-title")
                    .attr("y", -20)
                    .attr("x", plotOptions.width/2)
                    .style("text-anchor", "middle")
                    .text(plotOptions.plotSubtitleDescription);              
            }
            
            // Get dynamic colors from the colourbrewer scale
            var color = d3.scale.ordinal().range(colorbrewer.Dark2[8]);  
            
            // Read in .csv data and make graph
            d3.csv(plotOptions.csvPath, parser,
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
        }
    
        
    }
})();