<template>
    <div class="health">
      <hr style="margin-top: 30px;">

      <h3>The Cumulated Covid-19 Confirmed Global Map 2020 - 2021</h3>
      <h4>From 2020-03-01 to 2021-11-01 (611 days)</h4>
      
      <div class="dayslider">
        <input id="slider" style = 'width:611px' type = "range" min="1" max = "611" value = "611" step="1"/>
        <span id="range"></span>
      </div>
      <svg id="proportionalmap" style="height:700px; width: 1200px"></svg>
     
    <hr style="margin-top: 30px;">	

      <h3>The Cumulated Covid-19 Bar chart 2020 - 2021 (Confirmed or Deaths)</h3>

      <div class = 'commands'>
			<select id = 'type'>
				<option value= 'cases'>Total Confirmed Cases</option>
				<option value= 'deaths'>Total Deaths</option>
			</select>
      </div>
      <div class="commands">
        <span class="filter" id="reset">Reset</span>
        <span class="filter" id="top10">Filter top 10 by value</span>
        <span class="filter" id="top20">Filter top 10 to 20 by value</span>
        <span class="filter" id="top30">Filter top 20 to 30 by value</span>
      </div>
    
      <div class="commands">
        <span class="sort" id="name">Order alphabetic by name</span>
        <span class="sort" id="asvalue">Order ascending by value</span>
        <span class="sort" id="desvalue">Order descending by value</span>
      </div>
    
      <div id="barchart" >
      <svg id = "barchartsvg" style="height:500px; width: 1200px"></svg></div>	
    
    <hr style="margin-top: 30px;">

      <h3>The Cumulated Covid-19 Vaccinated Global Map 2021</h3>
      <h4>Please click the area of a country on the map to get the details of people vaccinated and confirmed.</h4>
      <svg id="chloroplethmap" style="height:700px; width: 1200px"></svg> 

      <svg id="piechart" style="height:900px; width: 900px; margin-left: 0px; margin-top: 0px"></svg>
      <svg id="linechart" style="height:900px; width: 900px; margin-left: 900px; margin-top: -900px"></svg>


    </div>
</template>

<script>
import * as d3 from "d3";
const topojson = require('topojson')
export default{
    name: "Health",
    components:{

    },
      // data: function () {
  //   return {
  //     geodata: undefined,
  //   };
  // },
  methods: {
    map(){
      var dayslider = document.getElementById('slider');
      var days = document.getElementById('range');
      days.innerHTML = dayslider.value + "days";
      dayslider.oninput = function() {
        days.innerHTML = this.value + "days";
      } 

      var start = new Date("2020-03-01");
      //console.log(start);
      var end = new Date("2021-11-02");
      //console.log(end);
      var numberOfDays = d3.timeDay.count(start, end)
      //console.log(numberOfDays)
      var timeScale = d3.scaleTime()
          .domain([start, end])
          .range([0, numberOfDays])
      
      var promises = [];
      var files = ['healthcountries-110m.json' , 'totalcase&deaths.json'];
      files.forEach(url => promises.push(d3.json(url)));  //For each item in the 'files' array, load the json file by using promises.
      Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
          var world = values[0];
          var data = values[1];

          var format = d3.format(',.0f')
          console.log(format)

          //size circles by area with the specified domain and range, and we quantile the value scale
          var radius = d3.scaleSqrt([0, 46100496], [0, 60]);
          function checkdate(x){
              return x.date == '2021-11-01';
          }
          data = data.filter(checkdate);
          data = new Map(data.map(d1 => [d1.location,+d1.total_cases]))
      
          var svg1 = d3.select('#proportionalmap')
              .attr('viewBox', [30, 100, 950, 360]);
          
          var width = 800;
          var height = 800;

          svg1.append("text")
              .attr('x', 80)
              .attr('y', 15)
              .attr('fill', 'red')
              .style('font-size', '1em')
              .text(`The date is: 2021-11-01`);
          var projection = d3.geoMercator()
              .fitSize([width, height], topojson.feature(world, world.objects.land));

          var path = d3.geoPath().projection(projection); 

          //add the path (geoPath) for the all converted us.objects.nation (all states) data from TopoJSON to GeoJSON
          //set the filled color and the 'd' attribute with the created path generator
          svg1.append('path')
              .datum(topojson.feature(world, world.objects.land))
              .attr('fill', '#ccc')
              .attr('d', path);

          //add the path (geoPath) for the produced mesh of interior boundaries for all states to the svg
          //set the filled white color, the stroke attribute, the stroke-linejoin attribute and the 'd' attribute with the created path generator
          svg1.append('path')
              .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
              .attr('fill', 'none')
              .attr('stroke', 'black')
              .attr('stroke-linejoin', 'round')
              .attr('d', path);

          //create and add a legend for the map with circles
          //and set some attributes of the legend
          // add circle and text on the legend
          const legend = svg1.append('g')
              .attr('fill', 'black')
              .attr('transform', 'translate(840,160)')
              .attr('text-anchor', 'middle')
              .style('font', '16px sans-serif')
              .selectAll('g')
              .data([0, 50000, 800000, 3125000, 6250000, 12500000, 25000000, 50000000])
              .join('g');
          legend.append('circle')
              .attr('fill', 'none')
              .attr('stroke', 'purple')
              .attr('cy', d => -radius(d))
              .attr('r', radius);

          legend.append('text')
              .attr('y', d => -2 * radius(d))
              .attr('dy', '1.2em')
              .text(d3.format('.1s'));
          //console.log(topojson.feature(world, world.objects.countries).features)

          //draw and append the blue circles in the map with title
          svg1.append('g')
              .attr('fill', 'purple')
              .attr('fill-opacity', 0.5)
              .attr('stroke', '#fff')
              .attr('stroke-width', 0.5)
              .selectAll('circle')
              .data(topojson.feature(world, world.objects.countries).features
                  .map(d => (d.value = data.get(d.properties.name), d))  //create a map with the data id and the data value for the selected circle
                  .sort((a, b) => b.value - a.value))
              .join('circle')
              .attr('transform', d => `translate(${path.centroid(d)})`)  //set the position of circles to be near the centroid of their corresponded path
              .attr('r', d => radius(d.value))
              .append('title')
              .text(d => `${d.properties.name}, ${data.get(d.properties.name)}`);  //set the text of the added title (set the tooltip);
      })
      d3.selectAll("input").on("change",function change() {
          var getvalue = this.value;
          var date = timeScale.invert(getvalue);
          //console.log(date)
          var getdate = d3.timeFormat("%Y-%m-%d")(date);
          //console.log(getdate)

          var svg1 = d3.select('#proportionalmap')
            .attr('viewBox', [30, 100, 950, 360]);
          svg1.selectAll("text").remove()
          svg1.append("text")
              .attr('x', 80)
              .attr('y', 15)
              .attr('fill', 'red')
              .style('font-size', '1em')
              .text(`The date is: ${getdate}`);
          Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
              var world = values[0];
              var data = values[1];
              
              var width = 800;
              var height = 800;
              var projection = d3.geoMercator()
                .fitSize([width, height], topojson.feature(world, world.objects.land));
              var path = d3.geoPath().projection(projection);
              //size circles by area with the specified domain and range, and we quantile the value scale
              var radius = d3.scaleSqrt([0, 46100496], [0, 60]);

              //find the matched data as the input date
              function checkdate(x){
                  return x.date == getdate;
              }
              data = data.filter(checkdate);
              //console.log(data)
              data = new Map(data.map(d1 => [d1.location,+d1.total_cases]))
              var svg1 = d3.select('#proportionalmap');

              svg1.selectAll('circle').remove();
              
              const legend = svg1.append('g')
                  .attr('fill', 'black')
                  .attr('transform', 'translate(840,160)')
                  .attr('text-anchor', 'middle')
                  .style('font', '16px sans-serif')
                  .selectAll('g')
                  .data([0, 50000, 800000, 3125000, 6250000, 12500000, 25000000, 50000000])
                  .join('g');
              legend.append('circle')
                  .attr('fill', 'none')
                  .attr('stroke', 'purple')
                  .attr('cy', d => -radius(d))
                  .attr('r', radius);

              legend.append('text')
                  .attr('y', d => -2 * radius(d))
                  .attr('dy', '1.2em')
                  .text(d3.format('.1s'));
              //console.log(topojson.feature(world, world.objects.countries).features)
              //draw and append the blue circles in the map with title
              svg1.append('g')
                  .attr('fill', 'purple')
                  .attr('fill-opacity', 0.5)
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 0.5)
                  .selectAll('circle')
                  //.remove()
                  .data(topojson.feature(world, world.objects.countries).features
                      .map(d => (d.value = data.get(d.properties.name), d))  //create a map with the data id and the data value for the selected circle
                      .sort((a, b) => b.value - a.value))
                  .join('circle')
                  .attr('transform', d => `translate(${path.centroid(d)})`)  //set the position of circles to be near the centroid of their corresponded path
                  .attr('r', d => radius(d.value))
                  .append('title')
                  .text(d => `${d.properties.name}, ${data.get(d.properties.name)}`);  //set the text of the added title (set the tooltip)
            })
        })
    },
    bar(){
      var margin = { top: 50, left: 100, bottom: 50, right: 50 },
          width = 1200 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var svg = d3.select('#barchartsvg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

      var x = d3.scaleBand();
      var y = d3.scaleLinear();

      var delay = function (d, i) {
          return i * 50;
      };

      var reset, top10, top20, top30;
      var current, sortMode, filterMode;
      var xAxis, yAxis;

      d3.json('totalcase&deaths.json', d => {
          console.log('load data')
          return {
              location: d.location,
              total_cases: +d.total_cases,
              total_deaths: +d.total_deaths,
          };
      }).then(data => {
  
            function checkdate(x){
                return x.date == '2021-11-01';
            }
            data = data.filter(checkdate);
            console.log(data)
            function choose() {
                var option = document.getElementById('type').value;
                if(option == 'cases'){
                        top10 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(0, 10);
                        //console.log('this is top:')
                        //console.log(top10)
                        top20 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(10, 20);
                        //console.log(bottom10)
                        top30 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(20, 30);
                }
                if(option == 'deaths'){
                        top10 = data.sort((a, b) => d3.descending(a.total_deaths, b.total_deaths)).slice(0, 10);
                        //console.log('this is top:')
                        //console.log(top10)
                        top20 = data.sort((a, b) => d3.descending(a.total_deaths, b.total_deaths)).slice(10, 20);
                        //console.log(bottom10)
                        top30 = data.sort((a, b) => d3.descending(a.total_deaths, b.total_deaths)).slice(20, 30);
                        
                }       
                filter(filterMode);
                sort(sortMode);
                redraw();
          }
          document.getElementById('type').addEventListener('change',choose);
          reset = data.sort((a, b) => d3.ascending(a.location, b.location)).slice(0, 10);
          //console.log(JSON.stringify(reset));
          top10 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(0, 10);
          //console.log('this is top:')
          //console.log(top10)
          top20 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(10, 20);
          //console.log(bottom10)
          top30 = data.sort((a, b) => d3.descending(a.total_cases, b.total_cases)).slice(20, 30);

          filter('#reset');
          sort('#reset');

          toggleFilter('#reset');
          toggleSort('#reset');
          draw();
      });
            //sort by country name
            d3.select('#name')
                .on('click', () => {
                    sort('#name');
                    transition();
                    toggleSort('#name');
                });

            //sort by value
            d3.select('#asvalue')
                .on('click', () => {
                    sort('#asvalue');
                    transition();
                    toggleSort('#asvalue');
                });

            d3.select('#desvalue')
                .on('click', () => {
                    sort('#desvalue');
                    transition();
                    toggleSort('#desvalue');
                });

            ////

            //filter event handlers
            d3.select('#top10')
                .on('click', () => {
                    filter('#top10');
                    sort(sortMode);
                    toggleSort(sortMode);
                    toggleFilter('#top10');

                    redraw();
                });

      d3.select('#top20')
          .on('click', () => {
              filter('#top20');
              sort(sortMode);
              toggleSort(sortMode);
              toggleFilter('#top20');

              redraw();
          });

      d3.select('#top30')
          .on('click', () => {
              filter('#top30');
              sort(sortMode);
              toggleSort(sortMode);
              toggleFilter('#top30');

              redraw();
          });

      //Reset
      d3.select('#reset')
      .on('click', () => {
          filter('#reset');
          sort('#reset');
          toggleReset('#reset');

          redraw();
      });

      function filter(mode) {
          if (mode === '#reset') {
              current = JSON.parse(JSON.stringify(reset));
          } else if (mode === '#top10') {        
              current = JSON.parse(JSON.stringify(top10));
          } else if (mode === '#top20') {
              current = JSON.parse(JSON.stringify(top20));
          } else if (mode === '#top30') {
              current = JSON.parse(JSON.stringify(top30));
          }
          filterMode = mode;
      }
      console.log(filterMode);
      function sort(mode) {
          if (mode === '#reset') {
              current.sort((a, b) => d3.ascending(a.location, b.location));
          } else if (mode === '#name') {
              current.sort((a, b) => d3.ascending(a.location, b.location));
          } else if (mode === '#asvalue') {
              if(document.getElementById('type').value == 'cases'){
                current.sort((a, b) => d3.ascending(a.total_cases, b.total_cases));}
              else if(document.getElementById('type').value == 'deaths'){
                current.sort((a, b) => d3.ascending(a.total_deaths, b.total_deaths));}
          } else if (mode === '#desvalue') {
              if(document.getElementById('type').value == 'cases'){
                current.sort((a, b) => d3.descending(a.total_cases, b.total_cases));}
              else if(document.getElementById('type').value == 'deaths'){
                current.sort((a, b) => d3.descending(a.total_deaths, b.total_deaths));}
          }
          x.domain(current.map(d => d.location));
          sortMode = mode;
      }

      function toggleSort(id) {
          d3.selectAll('.sort')
              .style('background-color', '#eee');
          d3.select(id)
              .style('background-color', 'yellow');
          d3.select('#reset')
              .style('background-color', '#eee');
      }

      function toggleFilter(id) {
          d3.selectAll('.filter')
              .style('background-color', '#eee');
          d3.select(id)
              .style('background-color', 'lightgreen');
          d3.select('#reset')
              .style('background-color', '#eee');
      }

      function toggleReset(id) {
          d3.selectAll('.filter')
              .style('background-color', '#eee');
          d3.selectAll('.sort')
              .style('background-color', '#eee');
          d3.select(id)
              .style('background-color', 'red');
      }


      ///

      function redraw() {
          //update scale
          x.domain(current.map(d => d.location))
              .range([0, width])
              .paddingInner(0.2);
          var bars;
          if(document.getElementById('type').value == 'cases'){
            y.domain([0, d3.max(current, d => d.total_cases)])
                .range([height, 0]);
            ////////////////////////////////
            // DATA JOIN FOR BARS.
            bars = svg.selectAll('.bar')
                .data(current, d => d.location);

            // UPDATE.
            bars.transition()
                .duration(750)
                .delay(delay)
                .attr('x', d => x(d.location))
                .attr('width', x.bandwidth());

            // ENTER.
            bars.enter()
                .append('rect')
                .attr('x', d => x(d.location))
                .attr('y', y(0))
                .attr('width', x.bandwidth())
                .transition()
                .duration(750)
                .attr('class', 'bar')
                .attr('x', d => x(d.location))
                .attr('y', d => y(d.total_cases))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d.total_cases));

            // EXIT.
            bars.exit()
                .transition()
                .duration(750)
                .style('opacity', 0)
                .remove();
          }
        else if(document.getElementById('type').value == 'deaths'){
            y.domain([0, d3.max(current, d => d.total_deaths)])
                .range([height, 0]);
            ////////////////////////////////
            // DATA JOIN FOR BARS.
            bars = svg.selectAll('.bar')
                .data(current, d => d.location);

            // UPDATE.
            bars.transition()
                .duration(750)
                .delay(delay)
                .attr('x', d => x(d.location))
                .attr('width', x.bandwidth());

            // ENTER.
            bars.enter()
                .append('rect')
                .attr('x', d => x(d.location))
                .attr('y', y(0))
                .attr('width', x.bandwidth())
                .transition()
                .duration(750)
                .attr('class', 'bar')
                .attr('x', d => x(d.location))
                .attr('y', d => y(d.total_deaths))
                .attr('width', x.bandwidth())
                .attr('height', d => height - y(d.total_deaths));

            // EXIT.
            bars.exit()
                .transition()
                .duration(750)
                .style('opacity', 0)
                .remove();
        }
          ////////////////////////////////
          svg.selectAll('#x-axis')
              .transition()
              .duration(750)
              .delay(delay)
              .call(xAxis)
            
          svg.selectAll('#y-axis')
              .transition()
              .duration(750)
              .delay(delay)
              .call(yAxis)
    }

      function transition() {
          var transition = svg.transition()
              .duration(750);

          transition.selectAll('.bar')
              .delay(delay)
              .attr('x', d => x(d.location))

          transition  //transition the xaxis
              .select('#x-axis')
              .call(xAxis)

          transition  //transition the yaxis
              .select('#y-axis')
              .call(yAxis);


      }

      function draw() {
          //console.log(current.map(d => d.location))
          x.domain(current.map(d => d.location))
              .range([0, width])
              .paddingInner(0.2);

          y.domain([0, d3.max(current, d => d.total_cases)])
              .range([height, 0]);

          svg.selectAll('.bar')
              .data(current, d => d.location)
              .enter()
              .append('rect')
              .attr('class', 'bar')
              .attr('x', d => x(d.location))
              .attr('y', d => y(d.total_cases))
              .attr('width', x.bandwidth())
              .attr('height', d => height - y(d.total_cases));

          xAxis = d3.axisBottom()
              .scale(x);
          svg.append('g')
              .attr('id', 'x-axis')
              .attr('class', 'axis')
              .attr('transform', 'translate(0,' + height + ')')
              .call(xAxis);

          yAxis = d3.axisLeft()
              .scale(y)
              .ticks(15, 'd');

          svg.append('g')
              .attr('id', 'y-axis')
              .attr('class', 'axis')
              .call(yAxis);

          svg.append("text")
              .attr('x', width/2)             
              .attr('y', margin.top * 8.85)
              .attr('class', 'xlabel')
              .append('tspan').text('Country')
              .style('font-size', '1.2em');

          svg.append('text')
              .attr('x', - 3*height/7)
              .attr('y', - margin.left * 0.8)
              .attr('transform', 'rotate(-90)')
              .attr('class', 'ylabel')
              .append('tspan').text('Value')
              .style('font-size', '1.2em')
          
        }
    },
        map2(){
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
                      //.attr("xlink:href", ramp(color.interpolator()).toDataURL());

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


          /////////////////////////////////////////////////////////////
          //Choropleth code

          var promises = [];
          promises.push(d3.json("healthcountries-110m.json"));
          promises.push(d3.json("vaccination.json"));

          Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
              var world = values[0];
              var data = values[1];
              var clickname, clickdata;			

              //data = new Map(data.map(d1 => [d1.name,+d1.value]))
              var countries = new Map(world.objects.countries.geometries.map(d1 => [d1.location,+d1.people_vaccinated/10000]))  //get the variable 'states' by creating a new Map object that map the us states' id with the properties. The states' id is the key, the states' properties is the matched value in the map.
              console.log(countries)

              var format = d3.format(',.0f')
              console.log(format)

              var width = 800;
              var height = 800;

              var projection = d3.geoMercator()
                  .fitSize([width, height], topojson.feature(world, world.objects.land));
      
              var path = d3.geoPath().projection(projection); 
              var color = d3.scaleQuantize([0, 100], d3.schemeGreens[5])  //create a Quantize color scale based on the 9 colors of 'd3.schemeBlues' within the continuous domain: [1, 10].

              //original line from Observable
              //data = Object.assign(new Map(await d3.csv("unemployment.csv", ({id, rate}) => [id, +rate])), {title: "Unemployment rate (%)"})
              data = Object.assign(new Map(data.map(d2 => [d2.location,[+d2.vaccinated_rate, +d2.not_vaccinated_rate]])));  // clone a map object that the data id is the key and the rate in the data is the matched value.
              data.title = "Total Covid19 Vaccinated Rate (%)";

              // const svg = d3.create("svg")
              var svg2 = d3.select("#chloroplethmap")
                  .attr('viewBox', [30, 100, 950, 360]);

              svg2.append("g")
                  .attr("transform", "translate(650,20)")
                  .style('font-size', '1.2em')
                  .append(() => legend({ color, title: data.title, width: 260}));

              
              function pie(clickname, clickdata){
                  var slice = {  //a slice of pie
                      innerRadius: 0,
                      outerRadius: 100,
                      startAngle: 0,
                      endAngle: Math.PI / 2
                  };
                  console.log(slice)

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
                      .attr('stroke', '')
                      .on('mouseover', function () {
                          d3.select(this).transition()
                              .attr('stroke-width', '2')
                              .attr('stroke', 'red');
                          div.transition()
                              .style("opacity", 0.1);
                      })
                      .on('mouseout', function () {
                          d3.select(this).transition()
                              .attr('stroke-width', '1.5')
                              .attr('stroke', '');
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
                      .attr('fill', 'red')
                      .style('font-size', '1.2em')
                      .text(clickname + ' Vaccinated Pie Chart:');

                  svg3.append("text")
                      .attr('x', 60)
                      .attr('y', 40)
                      .attr('fill', 'black')
                      .style('font-size', '1.4em')
                      .text('Info Covid-19 Pie Chart & Line Chart (One Country):');
                      

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
                          var margin = { top: 220, left: 150, bottom: 20, right: 150 },
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
                              .attr('x', 465)
                              .attr('y', -31)
                              .attr('width', 15)
                              .attr('height', 15);
              
                          svg4.append("text")
                              .attr('x', 490)
                              .attr('y', -20)
                              .text(''+clickname);
              
                          svg4.append("text")
                              .attr('x', 360)             
                              .attr('y', 480)
                              .attr('text-anchor', 'middle')
                              .style('font-size', '14px')
                              .text(' Date ');
              
                          svg4.append("text")
                              .attr('x', -230)             
                              .attr('y', -80)
                              .attr('transform', 'rotate(-90)')
                              .attr('text-anchor', 'middle')
                              .style('font-size', '14px')
                              .text(' Cumulated Covid-19 Value ');
                              
              
                          svg4.append("text")
                              .attr('x', 250)             
                              .attr('y', -80)
                              .attr('text-anchor', 'middle')
                              .style('font-size', '1.2em')
                              .text(' Cumulated Covid-19 Line Chart (2020 - 2021) ');
                  });
              }

              pie("United States", [440559613,226607653]);
              line("United States");

              svg2.append("g")
                  .selectAll("path")
                  .data(topojson.feature(world, world.objects.countries).features)  //join the converted data from TopoJSON to GeoJSON to the selected path by mapping based on id and rate
                  .join("path")
                  .attr("fill", d => data.has(d.properties.name)?color(data.get(d.properties.name)[0]):'#ccc')  //fill the color of the path based on the data id and color scale
                  .attr("d", path)
                    //set the text of the added title (set the tooltip)
                  .on("click", function() {
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

          });
      }
  },
  mounted: function(){
    console.log('mounted');
    this.map();
    this.bar();
    this.map2();
  } 
}
</script>

 <style scoped>
  >>>body {
    font-family: "Lato", sans-serif;
    font-size: 16px;
    font-weight: normal;
    color: #555;
  }

  >>>h1 {
    padding: 10px;
    border: 3px solid #777;
    font-size: 1.8em;
  }

  >>>h2 {
    padding: 0px;
    margin: 0px 20px 0px 0px;
    font-size: 1.5em;
  }

  >>>h3 {
    padding: 0px;
    margin: 40px 20px 20px 0px;
    font-size: 1.2em;
  }

  >>>h4 {
    padding: 0px;
    margin: 20px 20px 20px 0px;
    color: blue;
    font-size: 1em;
    
  }

  >>>hr {
    margin: 2px 0px 0px 0px;
    height: 2px;
    border-width: 0;
    color: #bbb;
    background-color: #bbb;
  }

  >>>.title {
    display: block;
    font-size: 0.8em;
    font-style: italic;
    color: black;
    margin-bottom: 5px;
    text-decoration: underline;
  }

  >>>.sample {
    border: 2px dotted lightgrey;
    padding: 10px;
  }

  >>>.answer {
    border: 2px solid lightgrey;
    margin: 20px 0px;
    padding: 10px;
  }

  >>>.nb {
    font-size: 0.75em;
    color: #888;
  }

  >>>text {
    font-family: Courier;
    font-size: 0.75em;
  }


  >>>kbd {
    font-family: monospace;
  }

  >>>.alert h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
  }

  >>>.alert {
    background-color: rgb(248, 248, 248);
    padding: 5px;
    margin: 15px;
    font-size: 0.85em;
    color: #666;
    text-align: left;
    display: inline-block;
  }

  >>>.info {
    background-color: rgb(243, 248, 250);
  }

  >>>.warning {
    background-color: rgb(253, 248, 243);
  }

  >>>.danger {
    background-color: rgb(254, 246, 246);
  }

  >>>.container {
    display: flex; }

  >>>.col {
    flex: 1; }

  >>>.col-2 {
    flex: 2; }

  >>>.col-3 {
    flex: 3; }

  >>>.col-4 {
    flex: 3; }

  >>>pre {
    tab-size: 2;
  }

  >>>.countries {
    fill: whitesmoke;
  }

  >>>.countries :hover {
    fill: red;
  }

  >>>.country-borders {
    fill: none;
    stroke: black;
    stroke-width: 0.5px;
    stroke-linejoin: round;
    stroke-linecap: round;
    pointer-events: none;
  }
  >>>.legend {
    background-color: rgb(194, 196, 197);
    padding: 3px;
    position: absolute;
    left: 30px;
    width: 220px
  }
    
  >>>.legend div span {
    display: inline-block;
    height: 10px;
    margin-right: 3px;
    width: 10px;
  }
 </style>

<style scoped>
  >>>.axis path,
  >>>.axis line {
    fill: none;
    stroke: black;
    shape-rendering: crispEdges;
  }

  >>>.axis text {
    font-family: Courier;
    font-size: 1.2em;
  }

  >>>div.commands {
    font-family: Courier;
    font-size: 0.85em;
    font-weight: bold;
    text-align: center;
    cursor: default;
    user-select: none;
  }

  >>>svg {
    display: block;
    margin: auto;
    background-color: white;
  }

  >>>.bar {
    fill: rgb(178, 78, 32);
  }

  >>>text.xlabel {
    text-anchor: middle;
  }

  >>>text.ylabel {
    text-anchor: middle;
    alignment-baseline: central;
  }

  >>>text.name {
    font-weight: bold;
    text-anchor: middle;
    font-size: 1em;
    alignment-baseline: central;
  }

  >>>.sort {
    border-radius: 3px;
    background-color: #eee;
    display: inline-block;
    cursor: default;
  }

  >>>.sort,
  >>>label {
    font-family: Courier;
    color: #444;
    padding: 5px;
    margin: 5px;
  }

  >>>label {
    vertical-align: text-bottom;
  }

  >>>.filter {
    border-radius: 3px;
    background-color: #eee;
    padding: 5px;
    margin: 5px;
    color: #444;
    text-align: left;
    display: inline-block;
    cursor: default;
  }
  >>>div.tool {
    position: absolute;
    opacity: 1;
    background: white;
    color: red;
    pointer-events: none;
    font-size: 14px;
  }
</style>