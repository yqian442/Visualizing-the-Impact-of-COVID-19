/////////////////////////////////////////////////////////////
			//Color Legend code
            function map2(){
                function legend({
                    color,
                    title,
                    tickSize = 6,
                    width = 320,
                    height = 44 + tickSize,
                    marginTop = 18,
                    marginRight = 0,
                    marginBottom = 16 + tickSize,
                    marginLeft = 0,
                    ticks = width / 64,
                    tickFormat,
                    tickValues
                } = {}) {  //initialize some variables used in the legend function.
    
                    const svg = d3.create("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("viewBox", [0, 0, width, height])
                        .style("overflow", "visible")
                        .style("display", "block");
    
                    let x;
    
                    // Continuous
                    if (color.interpolator) {
                        x = Object.assign(color.copy()
                            .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
                            { range() { return [marginLeft, width - marginRight]; } });
    
                        svg.append("image")
                            .attr("x", marginLeft)
                            .attr("y", marginTop)
                            .attr("width", width - marginLeft - marginRight)
                            .attr("height", height - marginTop - marginBottom)
                            .attr("preserveAspectRatio", "none")
                            .attr("xlink:href", ramp(color.interpolator()).toDataURL());
    
                        //scaleSequentialQuantile doesn’t implement ticks or tickFormat.
                        if (!x.ticks) {
                            if (tickValues === undefined) {
                                const n = Math.round(ticks + 1);
                                tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
                            }
                            if (typeof tickFormat !== "function") {
                                tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
                            }
                        }
                    }
    
                    //discrete
                    else if (color.invertExtent) {
                        const thresholds
                            = color.thresholds ? color.thresholds() // scaleQuantize
                                : color.quantiles ? color.quantiles() // scaleQuantile
                                    : color.domain(); // scaleThreshold
    
                        const thresholdFormat
                            = tickFormat === undefined ? d => d
                                : typeof tickFormat === "string" ? d3.format(tickFormat)
                                    : tickFormat;
    
                        x = d3.scaleLinear()
                            .domain([-1, color.range().length - 1])
                            .rangeRound([marginLeft, width - marginRight]);
    
                        svg.append("g")
                            .selectAll("rect")
                            .data(color.range())
                            .join("rect")
                            .attr("x", (d, i) => x(i - 1))
                            .attr("y", marginTop)
                            .attr("width", (d, i) => x(i) - x(i - 1))
                            .attr("height", height - marginTop - marginBottom)
                            .attr("fill", d => d);
    
                        tickValues = d3.range(thresholds.length);
                        tickFormat = i => thresholdFormat(thresholds[i], i);
                    }
    
                    svg.append("g")
                        .attr("transform", `translate(0, ${height - marginBottom})`)
                        .call(d3.axisBottom(x)
                            .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
                            .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
                            .tickSize(tickSize)
                            .tickValues(tickValues))
                        .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
                        .call(g => g.select(".domain").remove())
                        .call(g => g.append("text")
                            .attr("y", marginTop + marginBottom - height - 6)
                            .attr("fill", "currentColor")
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .text(title));
    
                    return svg.node();
                }
    
                function ramp(color, n = 256) {
                    const canvas = DOM.canvas(n, 1);
                    const context = canvas.getContext("2d");
                    for (let i = 0; i < n; ++i) {
                        context.fillStyle = color(i / (n - 1));
                        context.fillRect(i, 0, 1, 1);
                    }
                    return canvas;
                }
    
                /////////////////////////////////////////////////////////////
                //Choropleth code
    
                var promises = [];
                promises.push(d3.json("countries-110m.json"));
                promises.push(d3.json("vaccination.json"));
    
                Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
                    var world = values[0];
                    var data = values[1];
                    var clickname, clickdata;			
    
                    //data = new Map(data.map(d1 => [d1.name,+d1.value]))
                    countries = new Map(world.objects.countries.geometries.map(d1 => [d1.location,+d1.people_vaccinated/10000]))  //get the variable 'states' by creating a new Map object that map the us states' id with the properties. The states' id is the key, the states' properties is the matched value in the map.
    
                    format = d3.format(',.0f')
    
                    width = 800;
                    height = 800;
    
                    projection = d3.geoMercator()
                    .fitSize([width, height], topojson.feature(world, world.objects.land));
            
                    path = d3.geoPath().projection(projection); 
                    color = d3.scaleQuantize([0, 100], d3.schemeGreens[5])  //create a Quantize color scale based on the 9 colors of 'd3.schemeBlues' within the continuous domain: [1, 10].
    
                    //original line from Observable
                    //data = Object.assign(new Map(await d3.csv("unemployment.csv", ({id, rate}) => [id, +rate])), {title: "Unemployment rate (%)"})
                    data = Object.assign(new Map(data.map(d2 => [d2.location,[+d2.vaccinated_rate, +d2.not_vaccinated_rate]])));  // clone a map object that the data id is the key and the rate in the data is the matched value.
                    data.title = "Total Covid19 Vaccinated Rate (%)";
    
                    // const svg = d3.create("svg")
                    svg2 = d3.select("#chloroplethmap")
                        .attr("viewBox", [0, 0, 830, 300]);
    
                    svg2.append("g")
                        .attr("transform", "translate(550,-20)")
                        .style('font-size', '1.2em')
                        .append(() => legend({ color, title: data.title, width: 260}));
    
                    
                    function pie(clickname, clickdata){
                        var slice = {  //a slice of pie
                            innerRadius: 0,
                            outerRadius: 100,
                            startAngle: 0,
                            endAngle: Math.PI / 2
                        };
    
                        var labels = ['People Vaccinated Rate', 'People Not Vaccinated Rate'];
                        var colors = ['#1ea67d', '#81f0ce'];
                    
                        var svg3 = d3.select('#piechart'),
                            width = 930,
                            height = 930,
                            radius = Math.min(width, height) / 4,
                            g = svg3.append('g')
                                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
                    
                        var color = d3.scaleOrdinal()
                            .domain(labels)  
                            .range(colors);
                    
                        var pie = d3.pie()  
                            .sort(null)  
                        .sortValues(d3.descending);  
                    
                        var path = d3.arc()  
                            .outerRadius(radius)  
                            .innerRadius(0);
                    
                        var label = d3.arc() 
                            .innerRadius(radius / 3)
                            .outerRadius(radius);
                    
                        var div = d3.select("body").append("div")
                            .attr("class", "tool");
                    
                        var arcs = g.selectAll('.arc')  
                            .data(pie(clickdata)) 
                            .enter()
                            .append('g')
                            .attr('class', 'arc')
                            .attr('stroke-width', '1.5')
                            .attr('stroke', 'black')
                            .on('mouseover', function (event) {
                                d3.select(this).transition()
                                    .attr('stroke-width', '2.4')
                                    .attr('stroke', 'red');
                                div.transition()
                                    .style("opacity", 1);
                            })
                            .on('mouseout', function (d, i) {
                                d3.select(this).transition()
                                    .attr('stroke-width', '1.5')
                                    .attr('stroke', 'black');
                                div.transition()
                                    .style("opacity", 0);
                            });
                        arcs.append('path')  
                            .attr('d', path)  
                            .attr("fill", function(d, i) {
                                return color(i);
                            })
                            .append("title")
                            .text((d, i) => `${labels[i]}：${d.value}%`)
                            .attr("fill", "red");
                        
                        svg3.selectAll("rect").remove()
                        svg3.selectAll("text").remove()
                        arcs.append("text")
                            .attr("transform", function (d) {
                                return "translate(" + label.centroid(d) + ")";
                            })
                            .attr("text-anchor", "middle")
                            .attr("fill", "black")
                            .style('font-size', '1.2em')
                            .text(function (d) {
                                return d.value + "%";
                            });
                        
                        //draw legend
                        //set legend of this chart
                        svg3.append('rect')
                            .style('fill', colors[0])
                            .style('stroke', colors[0])
                            .attr('x', 270)
                            .attr('y', 150)
                            .attr('width', 15)
                            .attr('height', 15);
    
                        svg3.append('text')
                            .attr('x', 290)
                            .attr('y', 162)
                            .text(labels[0]);
    
                        svg3.append('rect')
                            .style('fill', colors[1])
                            .style('stroke', colors[1])
                            .attr('x', 470)
                            .attr('y', 150)
                            .attr('width', 15)
                            .attr('height', 15);
    
                        svg3.append('text')
                            .attr('x', 490)
                            .attr('y', 162)
                            .text(labels[1]);
                        
                        svg3.append("text")
                            .attr('x', 220)
                            .attr('y', 100)
                            .attr('fill', 'rgb(106, 164, 230)')
                            .style('font-size', '1.2em')
                            .text(clickname + ' Vaccinated Pie Chart:');
    
                    }
    
                    function line(clickname){
                        d3.json('totalcasedata.json', d => {
                            return {
                                name: d.name,
                                date: d3.timeParse("%Y-%m-%d")(d.date),
                                value: +d.value,
                            };
                            }).then(data => {
                                //set margin
                                //console.log(data)
                                var margin = { top: 20, left: 150, bottom: 50, right: 100 },
                                    width = 980 - margin.left - margin.right,
                                    height = 680 - margin.top - margin.bottom;
                                
                                d3.select('#linechart').selectAll('*').remove();
                                var svg4 = d3.select('#linechart')
                                    .append('g')
                                    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
                                
                                //svg4.selectAll('*').remove()
                                function checkname(x){
                                    return x.name == clickname;
                                }
                                data = data.filter(checkname);
                                var all_val = data.map(d =>{return {date:d.date, value:d.value}})
                                console.log(all_val)
                                var data_now = all_val;//us.objects.countries.geometries.map(d => [d.id, d.properties])) 
                                console.log(data_now)
                                // x axis scale
                                console.log(d3.extent(data,function(d) {
                                    return d.date;
                                }))
                                var x = d3.scaleTime()
                                    .domain([new Date("2020-01-01"),new Date("2021-11-10")])
                                    .range([0, width]);
    
                                svg4.append('g')
                                    .attr('transform', 'translate(0,' + height + ')')
                                    .call(d3.axisBottom(x));
                                    
                                // y axis scale
                                var y = d3.scaleLinear()
                                    .domain([0, d3.max(data, function(d) {
                                    return +d.value;
                                })])
                                .range([height, 0]);
                    
                                svg4.append('g')
                                    .call(d3.axisLeft(y));
                                console.log(data_now)
                                    console.log(x(new Date(data_now[0].date)))
                                // create a new line generator
                                var line = d3.line()
                                    .x(d => {return x(new Date(d.date)); })
                                    .y(d => { return y(+d.value); });
    
                                //set colors
                                var color = 'purple';
                                
                                //draw lines in the svg
                                svg4.append("path")
                                   .datum(data_now)
                                   .attr("fill", "none")
                                   .attr("stroke", color)
                                   .attr("stroke-width", 2)
                                   .attr("d", line);
                                                
                                //set legend of this chart
                                svg4.append('rect')
                                    .style('fill', color)
                                    .style('stroke', color)
                                    .attr('x', 460)
                                    .attr('y', -15)
                                    .attr('width', 15)
                                    .attr('height', 15);
                    
                                svg4.append("text")
                                    .attr('x', 485)
                                    .attr('y', -3)
                                    .text(''+clickname);
                    
                                svg4.append("text")
                                    .attr('x', 390)             
                                    .attr('y', 650)
                                    .attr('text-anchor', 'middle')
                                    .style('font-size', '12px')
                                    .text(' Date ');
                    
                                svg4.append("text")
                                    .attr('x', -270)             
                                    .attr('y', -80)
                                    .attr('transform', 'rotate(-90)')
                                    .attr('text-anchor', 'middle')
                                    .style('font-size', '12px')
                                    .text(' Cumulated Covid-19 Value ');
                                    
                    
                                svg4.append("text")
                                    .attr('x', 240)             
                                    .attr('y', -5)
                                    .attr('text-anchor', 'middle')
                                    .style('font-size', '14px')
                                    .text(' Cumulated Covid-19 Line Chart (2020 - 2021) ');
                        });
                    }
    
                    svg2.append("g")
                        .selectAll("path")
                        .data(topojson.feature(world, world.objects.countries).features)  //join the converted data from TopoJSON to GeoJSON to the selected path by mapping based on id and rate
                        .join("path")
                        .attr("fill", d => data.has(d.properties.name)?color(data.get(d.properties.name)[0]):'#ccc')  //fill the color of the path based on the data id and color scale
                        .attr("d", path)
                          //set the text of the added title (set the tooltip)
                        .on("click", function(d) {
                            svg2.selectAll("path")
                                .data(topojson.feature(world, world.objects.countries).features)
                                .attr("fill", d => data.has(d.properties.name)?color(data.get(d.properties.name)[0]):'#ccc')
                            d3.select(this)							
                                .transition()
                                .attr('fill', 'purple');
                            console.log(d3.select(this))
                            clickname = d3.select(this)['_groups'][0][0]['__data__']['properties']['name'];
                            console.log(data)
    
                            clickdata = data.get(clickname);
                            console.log(clickdata)
    
                            pie(clickname, clickdata);
                            line(clickname);
                        })
                        .append("title")
                        .text(d => `${d.properties.name}, ${data.get(d.properties.name)}`)
                        
                    svg2.append("path")
                        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))  //add the path (geoPath) for the produced mesh of interior boundaries for all states to the svg
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-linejoin", "round")
                        .attr("d", path);
    
                    svg2.append("text")
                        .attr('x', 120)
                        .attr('y', -100)
                        .style('font-size', '1.2em')
                        .text('The Cumulated Covid19 Vaccinated Global Map');
            });
        }
        map2();