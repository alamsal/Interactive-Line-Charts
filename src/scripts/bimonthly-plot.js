// jshint ignore: start
(function(){
    
    var bimonthlyPlotOptions = {
        csvPath:'assets/BiMonthly.csv',
        chartId:'bi-monthly-graph',
        width:900,
        height:500,
        plotXaxisDescription:"Bi-monthly Values",
        plotYaxixDescription:"Percent",
        plotTitleDescription:"Squaw Peak-Oak, Gambel",
        plotSubtitleDescription: "2002-2015 (Click legends to toggle)",
        plotYaxisRangeMin:40,
        plotYaxixRangeMax:300,
        legendFromRight:150,
        legendSpacing:20          
    };  
    
    var plotBimonthly = new PlotBiMonthlyValues(bimonthlyPlotOptions);
        plotBimonthly.plotChart();

    function PlotBiMonthlyValues(plotOptions){
        this.plotChart = plotInteractiveBiMonthlyChart;
        
        function plotInteractiveBiMonthlyChart(){
            var format = d3.time.format("%d-%b");
            
            function parser(d) {
                d.pDate = format.parse(d.Date);
                return d;
            }              
      
            function plotBiMonthlyData(chartData,allCsvData){
                   
                var margin = {top: 70, right: 30, bottom: 75, left: 100};
                
                var minDay = format.parse(allCsvData[0].Date);
                var maxDay = format.parse(allCsvData[allCsvData.length-1].Date);
                
                //yAxix interval
                var yAxisMaxValue = plotOptions.plotYaxixRangeMax;
                var yAxisMinValue = plotOptions.plotYaxisRangeMin;
                
                //Axis ticks
                //var xAxisTickNumber = 20;
                var yAxisTickNumber = 7;
                
                var x = d3.time.scale().nice()
                    .domain([minDay,maxDay])
                    .range([0, plotOptions.width]);
            
                var y = d3.scale.linear()
                    .domain([yAxisMinValue,yAxisMaxValue])
                    .range([plotOptions.height, 0]);    
                
                //var xAxisLabels = generateXAxisLables();
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .outerTickSize(0)
                    //.ticks(xAxisTickNumber)
                    //.tickFormat(function(d){ return(xAxisLabels[d]);})
                    .orient("bottom");
            
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .ticks(yAxisTickNumber)
                    .orient("left");
                
                    
                // put the graph in the "miles" div
                var svg = d3.select("#"+plotOptions.chartId).append("svg")
                    .attr("width", plotOptions.width + margin.left + margin.right)
                    .attr("height", plotOptions.height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
                //Mouseover tip
                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([100, 40])
                    .html(function(d) {
                        return "Date: "+pad(parseInt(d.pDate.getMonth())+1) +"-"+pad(d.pDate.getDate()) +                   
                                "<br/>"+ "Annual Value: "+ d.Value +" %" +
                                "<br/>"+ "Average Value: "+ d.Avg +" %" +
                                "<br/>"+ "Low Value: "+ d.Low +" %" ;
                        });
            
                svg.call(tip);       
        
                //Create multiple lines for draw
                var lineValue = d3.svg.line()
                    .x(function(d) { return x(d.pDate); } )
                    .y(function(d) { return y(d.Value); } ); 
                
                var lineAverage = d3.svg.line()
                    .x(function(d){return x(d.pDate);})
                    .y(function(d){return y(d.Avg);});
                
                var lineLow = d3.svg.line()   
                    .x(function(d){return x(d.pDate);})
                    .y(function(d){return y(d.Low);}); 
                
                // add the x axis and x-label
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
                    .attr("y", plotOptions.height-10 + margin.bottom)
                    .text(plotOptions.plotXaxisDescription);
            
                // add the y axis and y-label
                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(0,0)")
                    .call(yAxis.tickSize(-plotOptions.width, 0, 0));
                
                svg.append("text")
                    .attr("class", "ylabel")
                    .attr("y", 30 - margin.left) // x and y switched due to rotation!!
                    .attr("x", 0 - (plotOptions.height / 2))
                    .attr("dy", "1em")
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "middle")
                    .text(plotOptions.plotYaxixDescription);
            
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
                    
                // draw the lines
                svg.append("path")
                    .attr("d", lineValue(chartData))
                    .attr("id", 'line_1')
                    .style("stroke","blue");                    
               svg.append("path")
                    .attr("d", lineAverage(chartData))
                    .attr("id", 'line_2')
                    .style("stroke-dasharray", ("2,1"))
                    .style("stroke","green");                    
                svg.append("path")
                    .attr("d", lineLow(chartData))
                    .attr("id", 'line_3')
                    .style("stroke","red");               

                
                //Add legends
                var lWidth = plotOptions.width-plotOptions.legendFromRight;
                var lSpace = plotOptions.legendSpacing;
                var color =['blue','green','red'];
                var legendText = ['Value','Average','Low'];
                var lineNumbers = 3;
                for(var i=1;i<=lineNumbers;++i){
                    svg.append("text")
                        .attr("x", lWidth)
                        .attr("y", (lSpace / 2) + i * lSpace)
                        .style("fill", function(){
                            return color[i-1];
                        })
                        .attr("class", "legend")
                        .text(legendText[i-1])
                        .attr("id",i) 
                        .on('click',function(){
                        //Toggle chart
                        var active = this.active ? false : true;
                        var opacity = active ? 0 : 1;                
                        d3.select("#line_" + this.id).style("opacity", opacity); 
                        d3.selectAll(".circle_" + this.id).style("opacity", opacity);               
                        this.active = active;
                        })                                
                        .on("mouseover", function () {
                            d3.select("#line_" + this.id).style("stroke-width", 8);
                            d3.selectAll(".circle_" + this.id).style("stroke-width", 8);
                        })
                        .on("mouseout",function(){
                            d3.select("#line_" + this.id).style("stroke-width", 4);
                            d3.selectAll(".circle_" +this.id).style("stroke-width", 4);
                        });        
                }     
                
            
                // display circles  
                  
                svg.selectAll(".dot")
                    .data(chartData)
                    .enter().append("circle")            
                    .attr('class', 'datapoint circle_1')
                    .attr('cx', function(d) { return x(d.pDate); })
                    .attr('cy', function(d) { return y(d.Value); })
                    .attr('r', 3)
                    .attr('fill', 'black')
                    .attr('stroke', 'blue')
                    .attr('stroke-width', '3')
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);    
        
            svg.selectAll(".dot")
                    .data(chartData)
                    .enter().append("circle")           
                    .attr('class', 'datapoint circle_3')
                    .attr('cx', function(d) { return x(d.pDate); })
                    .attr('cy', function(d) { return y(d.Low); })
                    .attr('r', 3)
                    .attr('fill', 'black')
                    .attr('stroke', 'red')
                    .attr('stroke-width', '3')
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide); 
                    
            svg.selectAll(".dot")
                    .data(chartData)
                    .enter().append("circle")           
                    .attr('class', 'datapoint circle_2')
                    .attr('cx', function(d) { return x(d.pDate); })
                    .attr('cy', function(d) { return y(d.Avg); })
                    .attr('r', 3)
                    .attr('fill', 'black')
                    .attr('stroke', 'green')
                    .attr('stroke-width', '3')
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide); 
                
                //Begin X-axis with January label       
                d3.select(svg.selectAll("text")[0][0]).attr('id','begin-axis');
                document.getElementById('begin-axis').textContent = "January";
                    
            }           
        
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
                
                plotBiMonthlyData(cleanData,csvData);
            
            });        
            
        }
    } 

})();