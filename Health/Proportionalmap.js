function map(){
    
    onload = function(){
        document.getElementById('slider').oninput = function() {document.getElementById('range').innerHTML = this.value;};
        document.getElementById('slider').oninput();
    }
    var start = new Date(2020, 02, 01);
    console.log(start)
    var end = new Date(2021, 10, 01);
    console.log(end)
    var numberOfDays = d3.timeDay.count(start, end)
    console.log(numberOfDays)
    var timeScale = d3.scaleTime()
        .domain([start, end])
	    .range([0, numberOfDays])
    
    var promises = [];
    var files = ['countries-110m.json' , 'totalcasedata.json'];
    files.forEach(url => promises.push(d3.json(url)));  //For each item in the 'files' array, load the json file by using promises.
    Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
        var world = values[0];
        var data = values[1];

        format = d3.format(',.0f')
        
        //size circles by area with the specified domain and range, and we quantile the value scale
        radius = d3.scaleSqrt([0, 46100496], [0, 80]);
        function checkdate(x){
            return x.date == '2020-12-31';
        }
        data = data.filter(checkdate);
        data = new Map(data.map(d1 => [d1.name,+d1.value]))
    
        svg1 = d3.select('#proportionalmap')
            .attr('viewBox', [0, 0, 800, 300]);

        width = 800;
        height = 800;

        svg1.append("text")
            .attr('y', -20)
            .attr('fill', 'red')
            .style('font-size', '1em')
            .text(`The date is: 2020-12-31`);
        projection = d3.geoMercator()
            .fitSize([width, height], topojson.feature(world, world.objects.land));

        path = d3.geoPath().projection(projection); 

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
            .attr('transform', 'translate(700,30)')
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
        console.log(topojson.feature(world, world.objects.countries).features)

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
            .text(d => `${d.properties.name}, ${data.get(d.properties.name)}`);  //set the text of the added title (set the tooltip)
        svg1.append("text")
            .attr('x', 120)
            .attr('y', -100)
            .style('font-size', '1.2em')
            .text('The Cumulated Covid19 Confirmed Global Map');
    })
    d3.selectAll("input").on("change",function change() {
        var getvalue = this.value;
        var date = timeScale.invert(getvalue);
        console.log(date)
        var getdate = d3.timeFormat("%Y-%m-%d")(date);
        console.log(getdate)
        svg1.selectAll("text").remove()
        svg1.append("text")
            .attr('y', -20)
            .attr('fill', 'red')
            .style('font-size', '1em')
            .text(`The date is: ${getdate}`);
        Promise.all(promises).then(function (values) {  //the Promise.all takes all the promises and return a single promise.
            var world = values[0];
            var data = values[1];

            format = d3.format(',.0f')
            
            //size circles by area with the specified domain and range, and we quantile the value scale
            radius = d3.scaleSqrt([0, 46100496], [0, 80]);

            //find the matched data as the input date
            function checkdate(x){
                return x.date == getdate;
            }
            data = data.filter(checkdate);
            console.log(data)
            data = new Map(data.map(d1 => [d1.name,+d1.value]))
            svg1 = d3.select('#proportionalmap')
                .attr('viewBox', [0, 0, 800, 300]);

            svg1.selectAll('circle').remove();

            width = 800;
            height = 800;
            
            const legend = svg1.append('g')
                .attr('fill', 'black')
                .attr('transform', 'translate(700,30)')
                .attr('text-anchor', 'middle')
                .style('font', '12px sans-serif')
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
            console.log(topojson.feature(world, world.objects.countries).features)
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

            svg1.append("text")
                .attr('x', 120)
                .attr('y', -100)
                .style('font-size', '1.2em')
                .text('The Cumulated Covid19 Confirmed Global Map');
        })
    })
}
map();
