<template>
  <div class="economic">
    <button id="control19">2019 Global Data</button>
    <button id="control20">2020 Global Data</button>
    <button id="control21">2021 Global Data</button>
    <h2>Major Economies GDP</h2>
    <div class="one" id="my_dataviz"></div>

    <div class="row" style="justify-content: center">
      <div>
        <h2>Global Unemployment Rate</h2>
        <svg id="chloropleth" style="background-color: white"></svg>
      </div>
      <div>
        <h2>Trade Between Top 5 GDP Countries</h2>
        <div class="two" id="chart"></div>
      </div>
    </div>

    <div style="display: none">
      <button id="gdp19">2019 GDPs</button>
      <button id="gdp20">2020 GDPs</button>
      <button id="gdp21">2021 GDPs</button>
      <button id="unem19">2019 unemployment rate</button>
      <button id="unem20">2020 unemployment rate</button>
      <button id="unem21">2021 unemployment rate</button>
      <button id="chord19">2019 Trade</button>
      <button id="chord20">2020 Trade</button>
      <button id="chord21">2021 Trade</button>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "eco",
  components: {},
  methods: {
    map() {
      const margin2 = { top: -30, right: 0, bottom: 0, left: 0 },
        width2 = 960,
        height2 = 400;

      const svg2 = d3
        .select("#my_dataviz")
        .attr("width", width2)
        .append("svg")
        .attr("class", "tree_svg")
        .attr("width", width2)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("id", "tree_content")
        .attr("transform", `translate(${margin2.left}, ${margin2.top})`);
      draw(19);

      function select(year) {
        var res;
        if (year === 19) {
          res = "GDP_2019.json";
        } else if (year == 20) {
          res = "GDP_2020.json";
        } else if (year == 21) {
          res = "GDP_2021.json";
        }
        return res;
      }

      function draw(year) {
        var df = select(year);
        document.getElementById("tree_content").innerHTML = "";
        // read json data
        d3.json(df).then(function (data) {
          // Give the data to this cluster layout:
          const root = d3.hierarchy(data).sum(function (d) {
            return d.value;
          }); // Here the size of each leave is given in the 'value' field in input data

          // Then d3.treemap computes the position of each element of the hierarchy
          d3
            .treemap()
            .size([width2, height2])
            .paddingTop(28)
            .paddingRight(7)
            .paddingInner(3)(root);

          // prepare a color scale
          const color = d3
            .scaleOrdinal()
            .domain(["Asia", "EU", "NA"])
            .range(["#9135f6", "#ee4379", "#ff3939"]);

          // And a opacity scale
          const opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

          // use this information to add rectangles:
          svg2
            .selectAll("rect")
            .data(root.leaves())
            .join("rect")
            .attr("x", function (d) {
              return d.x0;
            })
            .attr("y", function (d) {
              return d.y0;
            })
            .attr("width", function (d) {
              return d.x1 - d.x0;
            })
            .attr("height", function (d) {
              return d.y1 - d.y0;
            })
            .style("stroke", "black")
            .style("fill", function (d) {
              return color(d.parent.data.name);
            })
            .style("opacity", function (d) {
              return opacity(d.data.value);
            });

          // and to add the text labels
          svg2
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) {
              return d.x0 + 1;
            }) // +10 to adjust position (more right)
            .attr("y", function (d) {
              return d.y0 + 20;
            }) // +20 to adjust position (lower)
            .attr("font-weight", 700)
            .text(function (d) {
              return d.data.name;
            })
            .attr("font-size", "8px")
            .attr("fill", "white");

          // and to add the text labels
          svg2
            .selectAll("vals")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) {
              return d.x0 + 1;
            }) // +10 to adjust position (more right)
            .attr("y", function (d) {
              return d.y0 + 35;
            }) // +20 to adjust position (lower)
            .text(function (d) {
              return "$" + Math.round(d.data.value, 0) + "B";
            })
            .attr("font-weight", 700)
            .attr("font-size", "8px")
            .attr("fill", "white");

          // Add title for the 3 groups
          svg2
            .selectAll("titles")
            .data(
              root.descendants().filter(function (d) {
                return d.depth == 1;
              })
            )
            .enter()
            .append("text")
            .attr("x", function (d) {
              return d.x0;
            })
            .attr("y", function (d) {
              return d.y0 + 21;
            })
            .text(function (d) {
              return d.data.name;
            })
            .attr("font-size", "10px")
            .attr("fill", function (d) {
              return color(d.data.name);
            });
        });
      }

      d3.select("#gdp19").on("click", function () {
        draw(19);
      });

      d3.select("#gdp20").on("click", function () {
        draw(20);
        // document.getElementById("#unem20").click();
      });

      d3.select("#gdp21").on("click", function () {
        draw(21);
        // document.getElementById("#unem21").click();
      });
    },
    bar() {
      function chloropleth_map(data) {
        var json = data[0];
        var dataset = data[1];
        // var margin = { top: 80, left: 80, bottom: 80, right: 80 };
        var width = 500;
        var height = 500;
        var legend_labels = [
          "none",
          "<=5%",
          "5% - 8%",
          "8% - 11%",
          "11% - 14%",
          "14% - 17%",
          "17% - 20%",
          "> 20%",
        ];
        var legend_band = [0, 10, 16, 31, 46, 61, 76, 91];
        var ls_w = 20,
          ls_h = 20;
        var color = d3.scaleSequential(d3.interpolateOranges);

        json.features.forEach(function (d) {
          var result = dataset.filter(function (datum) {
            return d.properties.name === datum.id;
          });

          d.properties.value = result[0] !== undefined ? result[0].value : 0;
        });

        var svg = d3
          .select("#chloropleth")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "heatmap")
          .append("g")
          .attr("id", "heat_content");
        // .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

        var projection = d3.geoMercator().fitSize([width, height], json);
        var path = d3.geoPath().projection(projection);

        svg
          .selectAll("path")
          .data(json.features) //data join with features
          .enter()
          .append("path")
          .attr("fill", "grey")
          .attr("stroke", "white")
          .attr("d", path); //generate geographic path

        let chloro = svg.append("g").selectAll("path");
        chloro
          .data(json.features)
          .enter()
          .append("path")
          .attr("fill", function (d) {
            if (d.properties.value != 0) {
              return color(d.properties.value / 10);
            } else {
              return "none";
            }
          })
          .attr("d", path);

        svg.append("g").attr("class", "legend").attr("transform");

        var legend = svg
          .selectAll(".legend")
          .data(legend_band)
          .enter()
          .append("g")
          .attr("class", "legend");

        legend
          .append("rect")
          .attr("x", 20)
          .attr("y", function (d, i) {
            return 110 + height - i * ls_h - 11 * ls_h;
          })
          .attr("width", ls_w)
          .attr("height", ls_h)
          .style("fill", function (d) {
            return color(d / 100);
          });

        legend
          .append("text")
          .attr("x", 50)
          .attr("y", function (d, i) {
            return 110 + height - i * ls_h - 10 * ls_h - 4;
          })
          .text(function (d, i) {
            return legend_labels[i];
          });
      }

      var files = ["world-110m.geojson", "unem_19.json"];

      Promise.all(files.map((url) => d3.json(url))).then(function (data) {
        document.getElementById("chloropleth").innerHTML = "";
        chloropleth_map(data);
      });

      d3.select("#unem19").on("click", function () {
        var files = ["world-110m.geojson", "unem_19.json"];

        Promise.all(files.map((url) => d3.json(url))).then(function (data) {
          document.getElementById("chloropleth").innerHTML = "";
          chloropleth_map(data);
        });
      });

      d3.select("#unem20").on("click", function () {
        var files = ["world-110m.geojson", "unem_20.json"];

        Promise.all(files.map((url) => d3.json(url))).then(function (data) {
          document.getElementById("chloropleth").innerHTML = "";
          chloropleth_map(data);
        });
      });

      d3.select("#unem21").on("click", function () {
        var files = ["world-110m.geojson", "unem_21.json"];

        Promise.all(files.map((url) => d3.json(url))).then(function (data) {
          document.getElementById("chloropleth").innerHTML = "";
          chloropleth_map(data);
        });
      });
    },
    map2() {
      var margin = { left: 50, top: 0, right: 50, bottom: 0 },
        width = 400, // more flexibility: Math.min(window.innerWidth, 1000)
        height = 500, // same: Math.min(window.innerWidth, 1000)
        innerRadius = Math.min(width, height) * 0.39,
        outerRadius = innerRadius * 1.1;

      var names = ["USA", "China", "Japan", "Germany", "UK"],
        colors = ["#301E1E", "#083E77", "#342350", "#567235", "#8B161C"],
        opacityDefault = 0.8;

      var matrix19 = [
        [0, 40.2, 10.8, 10.3, 5],
        [8.6, 0, 16.5, 9.9, 2.3],
        [5.8, 14, 0, 1.9, 1.6],
        [5.5, 7.1, 2.3, 0, 3.5],
        [5.8, 7, 1.7, 7.3, 0],
      ];

      var matrix20 = [
        [0, 41.2, 9.9, 10.8, 4.2],
        [11.5, 0, 18.5, 11.5, 2.1],
        [4.8, 13.5, 0, 1.6, 1],
        [5.5, 7.6, 2, 0, 9.6],
        [5, 8, 1.6, 6.3, 0],
      ];

      var matrix21 = [
        [0, 47.4, 10.5, 11, 4.8],
        [10.9, 0, 18.3, 10.5, 2],
        [5.9, 14.5, 0, 1.5, 0.9],
        [5.4, 9.8, 2.2, 0, 2.4],
        [4.8, 8.1, 1.4, 5.9, 0],
      ];

      var colors2 = d3
        .scaleOrdinal()
        .domain(d3.range(names.length))
        .range(colors);

      var chord = d3.chord().padAngle(0.15).sortChords(d3.descending);

      var arc = d3
        .arc()
        .innerRadius(innerRadius * 1.01)
        .outerRadius(outerRadius);

      var path = d3.ribbon().radius(innerRadius);

      function draw_chord(m) {
        document.getElementById("chart").innerHTML = "";

        var svg = d3
          .select("#chart")
          .append("svg")
          .attr("class", "chord_chart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" +
              (width / 2 + margin.left) +
              "," +
              (height / 2 + margin.top) +
              ")"
          )
          .datum(chord(m));

        var outerArcs = svg
          .selectAll("g.group")
          .data(function (chords) {
            return chords.groups;
          })
          .enter()
          .append("g")
          .attr("class", "group");

        outerArcs
          .append("path")
          .style("fill", function (d) {
            return colors2(d.index);
          })
          .attr("d", arc);

        outerArcs
          .append("text")
          .each(function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
          })
          .attr("dy", ".35em")
          .attr("class", "titles")
          .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
          })
          .attr("transform", function (d) {
            return (
              "rotate(" +
              ((d.angle * 180) / Math.PI - 90) +
              ")" +
              "translate(" +
              (outerRadius + 10) +
              ")" +
              (d.angle > Math.PI ? "rotate(180)" : "")
            );
          })
          .text(function (d, i) {
            return names[i];
          });

        svg
          .selectAll("path.chord")
          .data(function (chords) {
            return chords;
          })
          .enter()
          .append("path")
          .attr("class", "chord")
          .style("fill", function (d) {
            return colors2(d.source.index);
          })
          .style("opacity", opacityDefault)
          .attr("d", path);
      }

      draw_chord(matrix19);

      d3.select("#chord19").on("click", function () {
        draw_chord(matrix19);
      });

      d3.select("#chord20").on("click", function () {
        draw_chord(matrix20);
      });

      d3.select("#chord21").on("click", function () {
        draw_chord(matrix21);
      });
    },

    control() {
      d3.select("#control19").on("click", function () {
        document.getElementById("gdp19").click();
        document.getElementById("unem19").click();
        document.getElementById("chord19").click();
      });

      d3.select("#control20").on("click", function () {
        document.getElementById("gdp20").click();
        document.getElementById("unem20").click();
        document.getElementById("chord20").click();
      });

      d3.select("#control21").on("click", function () {
        document.getElementById("gdp21").click();
        document.getElementById("unem21").click();
        document.getElementById("chord21").click();
      });
    },
  },
  mounted: function () {
    this.map();
    this.bar();
    this.map2();
    this.control();
  },
};
</script>
<style>
.tree_svg {
  padding: 10px;
}

.tree_svg:hover {
  border-radius: 25px;
  background-color: #f6acac;
  -webkit-box-shadow: 10px 10px 99px 6px #f6acac;
  -moz-box-shadow: 10px 10px 99px 6px #f6acac;
  box-shadow: 10px 10px 99px 6px #f6acac;
}

.heatmap {
  padding: 10px;
}

.heatmap:hover {
  border-radius: 25px;
  /*background-color:  #f6acac;*/
  -webkit-box-shadow: 10px 10px 99px 6px #f6acac;
  -moz-box-shadow: 10px 10px 99px 6px #f6acac;
  box-shadow: 10px 10px 99px 6px #f6acac;
}

.chord_chart {
  padding: 10px;
}

.chord_chart:hover {
  border-radius: 25px;
  /*background-color:  #f6acac;*/
  -webkit-box-shadow: 10px 10px 99px 6px #f6acac;
  -moz-box-shadow: 10px 10px 99px 6px #f6acac;
  box-shadow: 10px 10px 99px 6px #f6acac;
}
@media (min-width: 600px) {
  #chart {
    font-size: 16px;
  }
}
</style>
<style scoped>
/*#tooltip {*/
/*    color: #454545;*/
/*    opacity: .9;*/
/*    background: #eee;*/
/*    padding: 5px;*/
/*    border: none;*/
/*    border-radius: 5px;*/
/*    position: absolute;*/
/*    z-index: 10;*/
/*    visibility: hidden;*/
/*    white-space: nowrap;*/
/*    pointer-events: none;*/
/*}*/

text {
  overflow: auto;
}

body {
  justify-content: center;
  text-align: center;
}
button {
  background: #ff673f;
  color: #fff;
  border: none;
  position: relative;
  height: 60px;
  font-size: 1.6em;
  padding: 0 2em;
  cursor: pointer;
  transition: 800ms ease all;
  outline: none;
}
button:hover {
  background: #fff;
  color: #1aab8a;
}
button:before,
button:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  height: 2px;
  width: 0;
  background: #1aab8a;
  transition: 400ms ease all;
}
button:after {
  right: inherit;
  top: inherit;
  left: 0;
  bottom: 0;
}
button:hover:before,
button:hover:after {
  width: 100%;
  transition: 800ms ease all;
}

.canvas {
  margin: 0;
}

h1 {
  margin: 30px 0 30px 0;
}
</style>