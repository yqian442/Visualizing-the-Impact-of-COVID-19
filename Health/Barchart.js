function bar(){
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
    var xAxis;

    d3.json('deathsdata2021_11_01.json', d => {
        console.log('load data')
        return {
            name: d.name,
            value: +d.value,
        };
    }).then(data => {
        reset = data.sort((a, b) => d3.ascending(a.name, b.name)).slice(0, 10);
        //console.log(JSON.stringify(reset));
        top10 = data.sort((a, b) => d3.descending(a.value, b.value)).slice(0, 10);
        //console.log('this is top:')
        //console.log(top10)
        top20 = data.sort((a, b) => d3.descending(a.value, b.value)).slice(10, 20);
        //console.log(bottom10)
        top30 = data.sort((a, b) => d3.descending(a.value, b.value)).slice(20, 30);

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

    function sort(mode) {
        if (mode === '#reset') {
            current.sort((a, b) => d3.ascending(a.name, b.name));
        } else if (mode === '#name') {
            current.sort((a, b) => d3.ascending(a.name, b.name));
        } else if (mode === '#asvalue') {
            current.sort((a, b) => d3.ascending(a.value, b.value));
        } else if (mode === '#desvalue') {
            current.sort((a, b) => d3.descending(a.value, b.value));
        }
        x.domain(current.map(d => d.name));
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
        x.domain(current.map(d => d.name))
            .range([0, width])
            .paddingInner(0.2);
            
        ////////////////////////////////
        // DATA JOIN FOR BARS.
        var bars = svg.selectAll('.bar')
            .data(current, d => d.name);

        // UPDATE.
        bars.transition()
            .duration(750)
            .delay(delay)
            .attr('x', d => x(d.name))
            .attr('width', x.bandwidth());

        // ENTER.
        bars.enter()
            .append('rect')
            .attr('x', d => x(d.name))
            .attr('y', d => y(0))
            .attr('width', x.bandwidth())
            .transition()
            .duration(750)
            .attr('class', 'bar')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value));

        // EXIT.
        bars.exit()
            .transition()
            .duration(750)
            .style('opacity', 0)
            .remove();

        ////////////////////////////////
        //xaxis
        var xaxi = svg.selectAll('#x-axis')
            .transition()
            .duration(750)
            .delay(delay)
            .call(xAxis)


    }

    function transition() {
        var transition = svg.transition()
            .duration(750);

        transition.selectAll('.bar')
            .delay(delay)
            .attr('x', d => x(d.name))

        transition  //transition the axis
            .select('#x-axis')
            .call(xAxis)


    }

    function draw() {
        console.log(current.map(d => d.name))
        x.domain(current.map(d => d.name))
            .range([0, width])
            .paddingInner(0.2);

        y.domain([0, d3.max(current, d => d.value*6.5)])
            .range([height, 0]);

        svg.selectAll('.bar')
            .data(current, d => d.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value));

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
            .attr('class', 'axis')
            .call(yAxis);

        svg.append("text")
            .attr('x', width/2)             
            .attr('y', margin.top * 8.85)
            .attr('class', 'xlabel')
            .append('tspan').text('Country')
            .style('font-size', '1.2em');

        svg.append('text')
            .attr('x', - height/2)
            .attr('y', - margin.left * 0.7)
            .attr('transform', 'rotate(-90)')
            .attr('class', 'ylabel')
            .append('tspan').text('Deaths')
            .style('font-size', '1.2em')
        
        svg.append("text")
            .attr('x', width / 2)             
            .attr('y', margin.top - 70)
            .attr('class', 'xlabel')
            .append('tspan').text('Cumulated Bar Chart of Deaths - Covid 19 (11/01/2021)')
            .style('font-size', '1.2em');
    }
}
bar();