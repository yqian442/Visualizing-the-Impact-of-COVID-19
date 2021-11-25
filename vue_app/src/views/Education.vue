<template>
  <div class="education">
    <div id="tree_graph">
      <h4 id="temp" style="text-align: center">
        Affected Regions/Countries(Based on Most Recent Data:2021/10/31)
      </h4>
    </div>
    <hr />
    <div id="ans00">
      <h4 id="temp" style="text-align: center">School Closure Status</h4>
      <svg id="chart1" width="975" height="580"></svg>
      <input
        id="slider"
        style="width: 500px; margin-left: 0px; margin-top: 30px"
        type="range"
        min="0"
        max="17"
        value="16"
        step="1"
      />
      <span id="range"></span>
    </div>

    <hr style="margin-top: 50px" />
    <div id="ans4">
      <h4 style="text-align: center">School Closure Status</h4>
      <div style="margin-left: 5px; margin-bottom: 20px">
        <i class="legen" style="background: #ca0020"></i
        ><b>Closed due to COVID-19</b>
        <i class="legen" style="background: #f4a582"></i><b>Partially open</b>
        <i class="legen" style="background: #92c5de"></i><b>Academic break</b>
        <i class="legen" style="background: #0571b0"></i><b>Fully open</b>
      </div>
      <div style="margin-left: 125px" id="leafmap"></div>

      <input
        id="slider2"
        style="width: 500px; margin-left: 0px; margin-top: 30px"
        type="range"
        min="0"
        max="17"
        value="16"
        step="1"
      />
      <span id="range2"></span>
    </div>

    <div class="answer2">
      <hr style="margin-top: 50px" />
      <h4 style="text-align: center">School Close Period</h4>

      <div class="commands">
        <select id="close_type">
          <option value="all_d">All Close Period</option>
          <option value="full">Fully Closed</option>
          <option value="partial">Partially Closed</option>
        </select>
      </div>
      <div class="commands">
        <span class="filter" id="defa">Default</span>
        <span class="filter" id="t5">Filter top 5 by value</span>
        <span class="filter" id="b5">Filter bottom 5 by value</span>
        <label
          ><input
            style="margin: 0 5px 0 0"
            type="button"
            id="reset"
          />Reset</label
        >
      </div>
      <div class="commands">
        <span class="sort" id="value_asc">order ascending by value</span>
        <span class="sort" id="value_desc">order descending by value</span>
      </div>

      <div id="chart"></div>
    </div>
    <hr />
    <div id="pie_">
      <h4 id="temp" style="text-align: center">
        Affected Learners(by School Type and Gender)
      </h4>
      <label>Gender</label>
      <select id="c0">
        <option value="all" selected>All</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>

      <label>Country1</label>
      <select id="c1">
        <option value="World">World</option>
        <option value="Arab States">Arab States</option>
        <option value="Central and Eastern Europe">
          Central and Eastern Europe
        </option>
        <option value="Central Asia">Central Asia</option>
        <option value="East Asia and the Pacific">
          East Asia and the Pacific
        </option>
        <option value="Latin America and the Caribbean">
          Latin America and the Caribbean
        </option>
        <option value="North America and Western Europe">
          North America and Western Europe
        </option>
        <option value="South and West Asia" selected>
          South and West Asia
        </option>
      </select>
      <label>Country2</label>
      <select id="c2">
        <option value="World">World</option>
        <option value="Arab States">Arab States</option>
        <option value="Central and Eastern Europe">
          Central and Eastern Europe
        </option>
        <option value="Central Asia">Central Asia</option>
        <option value="East Asia and the Pacific">
          East Asia and the Pacific
        </option>
        <option value="Latin America and the Caribbean">
          Latin America and the Caribbean
        </option>
        <option value="North America and Western Europe" selected>
          North America and Western Europe
        </option>
        <option value="South and West Asia">South and West Asia</option>
      </select>
      <button v-on:click="draw_pie" style="margin-left: 14px">
        Show Details
      </button>
      <!-- <input type = "submit" onclick = draw() /> -->

      <div id="dist" style="margin-top: 40px">
        <svg id="sc1" style="margin-left: 40px"></svg>
        <svg id="sc2" style="margin-left: 50px"></svg>
        <div id="dist2"></div>
      </div>
    </div>
  </div>
</template>

<script>
const topojson = require("topojson");
import $L from "leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";
// import HomePage from "@/components/Homepage.vue";
export default {
  name: "Education",
  components: {},
  // data: function () {
  //   return {
  //     geodata: undefined,
  //   };
  // },
  methods: {
    draw_pie: function () {
      var c0 = document.getElementById("c0").value;
      var c1 = document.getElementById("c1").value;
      console.log(c0);
      var c2 = document.getElementById("c2").value;
      console.log(c2);

      var width = 400;
      var height = 400;
      //var base_ = d3.select('#dist')
      //base_.selectAll('svg').remove()
      function checkstatus(x) {
        return x.Category == c0;
      }

      d3.csv("learners_distribution.csv", (d) => {
        d.val_c = +d[c1];
        return d;
      }).then((data) => {
        console.log(data);
        var svg = d3.select("#sc1").attr("width", width).attr("height", height);

        var data_all = data.filter(checkstatus);
        svg.selectAll("*").remove();
        d3.select("#dist2").selectAll("*").remove();

        var radius = Math.min(width, height) / 2.43,
          g = svg
            .append("g")
            .attr(
              "transform",
              "translate(" + width / 2 + "," + height / 2 + ")"
            );

        var color = d3.scaleOrdinal(d3.schemeRdBu[5]); //🎒 explain:

        var pie = d3
          .pie() //🎒 explain:
          .value((d) => d.val_c)
          //.sort(null)  //🎒 explain:
          .sort(function (a, b) {
            return a.Level.localeCompare(b.Level);
          });
        // .sort(function(a, b) { return a.age.localeCompare(b.age); })  //🎒 explain:
        // .sortValues(d3.descending);  //🎒 explain:

        var path = d3
          .arc() //🎒 explain:
          .outerRadius(radius) //🎒 explain:
          .innerRadius(100); //🎒 explain:

        //🎒 change to a donut chart

        var label = d3
          .arc() //🎒 explain:
          .outerRadius(radius + 40) //🎒 explain:
          .innerRadius(60); //🎒 explain:

        var arc = g
          .selectAll(".arc") //🎒 explain:
          .data(pie(data_all)) //🎒 explain:
          .enter()
          .append("g")
          .attr("class", "arc");

        var arc2 = arc
          .append("path") //🎒 explain:
          //🎒 explain:
          .attr("fill", (d) => color(d.data.Level)) //🎒 explain:
          .attr("opacity", 0.5)
          .attr("stroke", "white");

        arc2
          .transition()
          .delay(function (d, i) {
            return i * 200;
          })
          .attrTween("d", (d) => {
            var single = d3.interpolate(d.startAngle + 0.5, d.endAngle);

            return function (x1) {
              d.endAngle = single(x1);
              return path(d);
            };
          });
        arc
          .append("text")
          .attr("id", "label_tag")
          .attr("x", -35)
          .attr("y", -10)
          .attr("opacity", 0)
          .attr("font-size", "13px");

        arc
          .append("text")
          .attr("id", "label_tag2")
          .attr("x", -75)
          .attr("y", 20)
          .attr("opacity", 0)
          .attr("font-size", "13px");

        arc2
          .on("mouseover", function () {
            //console.log(d3.select(this))

            var data_select =
              d3.select(this)["_groups"][0][0]["__data__"]["data"];
            d3.select(this).attr("stroke-width", 6).attr("stroke", "yellow");
            d3.select("#label_tag2")
              .text("Affected Learners: " + (data_select["val_c"] | 0))
              .attr("opacity", 1);
            d3.select("#label_tag")
              .text(data_select["Level"])
              .attr("opacity", 1);

            // .transition()
            // .duration(700)
            // .attr('transform', d=>'translate(' + (path.centroid(d)[0] / 3) + ',' + (path.centroid(d)[1] / 3) + ')');
          })
          .on("mouseout", function () {
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "white")
              .transition()
              .duration(700)
              .attr("transform", "translate(0,0)");
          })
          .append("title")
          .text((d) => `${d.data.Level}, ${d.data.val_c}`);

        console.log(data_all);

        arc
          .append("text")
          .text((d) => d.data.Level)
          .attr("fill", "white")
          .attr("font-size", "11px")
          .style("text-anchor", "middle")
          .transition()
          .delay(function (d, i) {
            return i * 220;
          })
          .attr("fill", "black")
          .attr("transform", (d) => "translate(" + label.centroid(d) + ")"); //🎒 explain:
      });

      d3.csv("learners_distribution.csv", (d) => {
        d.val_c = +d[c2];
        return d;
      }).then((data) => {
        var svg = d3.select("#sc2").attr("width", width).attr("height", height);

        var data_all = data.filter(checkstatus);
        svg.selectAll("*").remove();
        var radius = Math.min(width, height) / 2.43,
          g = svg
            .append("g")
            .attr(
              "transform",
              "translate(" + width / 2 + "," + height / 2 + ")"
            );

        var color = d3.scaleOrdinal(d3.schemeRdBu[5]); //🎒 explain:

        var pie = d3
          .pie() //🎒 explain:
          .value((d) => d.val_c)
          //.sort(null)  //🎒 explain:
          .sort(function (a, b) {
            return a.Level.localeCompare(b.Level);
          }); //🎒 explain:
        //.sortValues(d3.descending);  //🎒 explain:

        var path = d3
          .arc() //🎒 explain:
          .outerRadius(radius) //🎒 explain:
          .innerRadius(100); //🎒 explain:

        //🎒 change to a donut chart

        var label = d3
          .arc() //🎒 explain:
          .outerRadius(radius + 40) //🎒 explain:
          .innerRadius(60); //🎒 explain:

        var arc = g
          .selectAll(".arc") //🎒 explain:
          .data(pie(data_all)) //🎒 explain:
          .enter()
          .append("g")
          .attr("class", "arc");

        var arc2 = arc
          .append("path") //🎒 explain:
          //🎒 explain:
          .attr("fill", (d) => color(d.data.Level)) //🎒 explain:
          .attr("opacity", 0.5)
          .attr("stroke", "white");

        arc2
          .transition()
          .delay(function (d, i) {
            return i * 200;
          })
          .attrTween("d", (d) => {
            var single = d3.interpolate(d.startAngle + 0.5, d.endAngle);

            return function (x1) {
              d.endAngle = single(x1);
              return path(d);
            };
          });

        arc
          .append("text")
          .attr("id", "label_tag3")
          .attr("x", -35)
          .attr("y", -10)
          .attr("opacity", 0)
          .attr("font-size", "13px");

        arc
          .append("text")
          .attr("id", "label_tag4")
          .attr("x", -75)
          .attr("y", 20)
          .attr("opacity", 0)
          .attr("font-size", "13px");

        arc2
          .on("mouseover", function () {
            //console.log(d3.select(this))

            var data_select =
              d3.select(this)["_groups"][0][0]["__data__"]["data"];
            d3.select(this).attr("stroke-width", 6).attr("stroke", "yellow");
            d3.select("#label_tag4")
              .text("Affected Learners: " + (data_select["val_c"] | 0))
              .attr("opacity", 1);
            d3.select("#label_tag3")
              .text(data_select["Level"])
              .attr("opacity", 1);
            // .transition()
            // .duration(700)
            // .attr('transform', d=>'translate(' + (path.centroid(d)[0] / 3) + ',' + (path.centroid(d)[1] / 3) + ')');
          })
          .on("mouseout", function () {
            d3.select(this)
              .attr("stroke-width", 2)
              .attr("stroke", "white")
              .transition()
              .duration(700)
              .attr("transform", "translate(0,0)");
          })
          .append("title")
          .text((d) => `${d.data.Level}, ${d.data.val_c}`);

        console.log(data_all);

        arc
          .append("text")
          .text((d) => d.data.Level)
          .attr("font-size", "11px")
          .style("text-anchor", "middle")
          .attr("fill", "white")
          .transition()
          .delay(function (d, i) {
            return i * 220;
          })
          .attr("fill", "black")
          .attr("transform", (d) => "translate(" + label.centroid(d) + ")"); //🎒 explain:
      });
    },
  },
  mounted: function () {
    function aaa() {
      /*value_ind = this.value;
            date_data = data.filter(checknum);
            console.log(data)
            console.log('this')
            console.log(date_data[0])
            date_now = new Date(date_data[0].Date)
            document.getElementById('range').innerHTML = date_now.getMonth() + '/' + (date_now.getDate() + 1) + '/' + date_now.getFullYear(); */
      d3.select("#range").text("6/16/2021");
      var promises = [];
      var finalval = document.getElementById("slider").value;
      promises.push(d3.json("countries-110m.json"));
      promises.push(d3.json("mydatap.json"));

      Promise.all(promises).then(function (values) {
        //🎒 explain:
        var us = values[0];
        var data = values[1];
        //  var states = new Map(us.objects.countries.geometries.map(d => [d.id, d.properties]))

        var path = d3.geoPath();

        var color = d3.scaleOrdinal(
          [
            "Partially open",
            "Fully Open",
            "Academic break",
            "Closed due to COVID-19",
          ],
          d3.schemeRdBu[4]
        );

        function checknum(x) {
          return x.num == finalval;
        }
        data = data.filter(checknum);
        var date_data = data.filter(checknum);
        var date_now = new Date(date_data[0].Date);
        document.getElementById("range").innerHTML =
          date_now.getMonth() +
          1 +
          "/" +
          (date_now.getDate() + 1) +
          "/" +
          date_now.getFullYear();
        data = Object.assign(new Map(data.map((d) => [d.Country, d.Status])));
        var svg = d3.select("#chart1").attr("viewBox", [0, -30, 975, 330]);
        var format = (d) => `${d}`;
        var projection = d3
          .geoMercator()
          .fitSize([975, 610], topojson.feature(us, us.objects.countries));
        path = d3.geoPath().projection(projection);
        console.log(topojson.feature(us, us.objects.countries).features);

        svg
          .append("g")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.countries).features) //🎒 explain:
          .join("path")
          .attr("fill", (d) =>
            data.has(d.properties.name)
              ? color(data.get(d.properties.name))
              : "#ccc"
          ) //🎒 explain:
          .attr("d", path)
          .append("title")
          .text(
            (d) => `${d.properties.name} ${format(data.get(d.properties.name))}`
          );
      });

      d3.selectAll("#slider").on("change", function change() {
        var finalval = this.value;
        Promise.all(promises).then(function (values) {
          //🎒 explain:
          var us = values[0];
          var data = values[1];
          var states = new Map(
            us.objects.countries.geometries.map((d) => [d.id, d.properties])
          );

          var path = d3.geoPath();

          var color = d3.scaleOrdinal(
            [
              "Partially open",
              "Fully Open",
              "Academic break",
              "Closed due to COVID-19",
            ],
            d3.schemeRdBu[4]
          );

          function checknum(x) {
            return x.num == finalval;
          }
          data = data.filter(checknum);
          var date_data = data.filter(checknum);
          var date_now = new Date(date_data[0].Date);
          document.getElementById("range").innerHTML =
            date_now.getMonth() +
            1 +
            "/" +
            (date_now.getDate() + 1) +
            "/" +
            date_now.getFullYear();
          data = Object.assign(new Map(data.map((d) => [d.Country, d.Status])));
          var svg = d3.select("#chart1").attr("viewBox", [0, -30, 975, 330]);
          var format = (d) => `${d}`;
          var projection = d3
            .geoMercator()
            .fitSize([975, 610], topojson.feature(us, us.objects.countries));
          path = d3.geoPath().projection(projection);
          console.log(topojson.feature(us, us.objects.countries).features);

          svg
            .append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.countries).features) //🎒 explain:
            .join("path")
            .attr("fill", (d) =>
              data.has(d.properties.name)
                ? color(data.get(d.properties.name))
                : "#ccc"
            ) //🎒 explain:
            .attr("d", path)
            .append("title")
            .text(
              (d) =>
                `${d.properties.name} ${format(data.get(d.properties.name))}`
            );

          console.log(data);

          console.log(finalval);
          console.log(us);
          console.log(data);
          console.log(states);
          console.log(path);
          console.log(color);
          console.log(projection);
          console.log(svg);
        });
      });
      /////////////////////////////////////////////////////////////
      //Choropleth code

      // var promises = [];

      //promises.push(d3.json("countries-110m.json"));
      //promises.push(d3.json("mydatap.json"));
    }

    function ccc() {
      var mymap = $L.map("leafmap").setView([33, 23], 1.5);
      d3.json("world_map.geojson").then((world_map) => {
        //set up tileLayer with approprite mapbox style and size
        $L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
            "pk.eyJ1IjoieWl3ZWl5dSIsImEiOiJja3Y2N2E5N2I5NnltMnVrNjM3cGdkYzlsIn0.HG6dfV4lVGepFwlOuQl10g",
          {
            id: "mapbox/light-v10",
            tileSize: 512,
            attribution:
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            zoomOffset: -1,
          }
        ).addTo(mymap);

        var colormy = d3.scaleOrdinal(
          [
            "Closed due to COVID-19",
            "Partially open",
            "Academic break",
            "Fully open",
          ],
          d3.schemeRdBu[4]
        );
        d3.json("mydatap.json").then((data) => {
          function checknum(x) {
            return x.num == 16;
          }

          function getColor(d) {
            return data.has(d) ? colormy(data.get(d)) : "#ccc";
          }

          function mapstyle(x) {
            return {
              fillColor: getColor(x.properties.name),
              weight: 2,
              opacity: 1,
              color: "white",
              dashArray: "2",
              fillOpacity: 0.4,
            };
          }

          function markfeature(x) {
            var target_ = x.target;
            target_.setStyle({
              weight: 5,
              color: "grey",
            });

            var status = data.get(x.target.feature.properties.name);
            var country_name = x.target.feature.properties.name;
            var popup = $L
              .popup()
              .setLatLng(x.latlng)
              .setContent(
                "Country/Region: " + country_name + "<br>" + "Status: " + status
              )
              .openOn(mymap);
            console.log(popup);
            if (!$L.Browser.ie && !$L.Browser.opera && !$L.Browser.edge) {
              target_.bringToFront();
            }
          }

          function removefeature(x) {
            mymap.closePopup();
            var target_ = x.target;
            target_.setStyle({
              weight: 2,
              opacity: 1,
              color: "white",
              dashArray: "2",
              fillOpacity: 0.4,
            });
          }

          function event_feature(x, layer) {
            layer.on({
              mouseover: markfeature,
              mouseout: removefeature,
            });
          }

          data = data.filter(checknum);
          var date_now = new Date(data[0].Date);
          document.getElementById("range2").innerHTML =
            date_now.getMonth() +
            1 +
            "/" +
            (date_now.getDate() + 1) +
            "/" +
            date_now.getFullYear();

          data = Object.assign(new Map(data.map((d) => [d.Country, d.Status])));

          $L.geoJson(world_map, {
            style: mapstyle,
            onEachFeature: event_feature,
          }).addTo(mymap);
        });

        d3.select("#slider2").on("change", function change() {
          var final_val = this.value;
          d3.json("mydatap.json").then((data) => {
            //Step1. remove existing color layers
            mymap.eachLayer(function (layer) {
              mymap.removeLayer(layer);
            });

            $L.tileLayer(
              "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
                "pk.eyJ1IjoieWl3ZWl5dSIsImEiOiJja3Y2N2E5N2I5NnltMnVrNjM3cGdkYzlsIn0.HG6dfV4lVGepFwlOuQl10g",
              {
                id: "mapbox/light-v10",
                attribution:
                  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                tileSize: 512,
                zoomOffset: -1,
              }
            ).addTo(mymap);

            function checknum(x) {
              return x.num == final_val;
            }

            function getColor(d) {
              return data.has(d) ? colormy(data.get(d)) : "#ccc";
            }

            function mapstyle(x) {
              return {
                fillColor: getColor(x.properties.name),
                weight: 2,
                opacity: 1,
                color: "white",
                dashArray: "2",
                fillOpacity: 0.4,
              };
            }

            function markfeature(x) {
              var target_ = x.target;
              target_.setStyle({
                weight: 5,
                color: "grey",
              });

              var status = data.get(x.target.feature.properties.name);
              var country_name = x.target.feature.properties.name;
              var popup = $L
                .popup()
                .setLatLng(x.latlng)
                .setContent(
                  "Country/Region: " +
                    country_name +
                    "<br>" +
                    "Status: " +
                    status
                )
                .openOn(mymap);
              console.log(popup);
              if (!$L.Browser.ie && !$L.Browser.opera && !$L.Browser.edge) {
                target_.bringToFront();
              }
            }

            function removefeature(x) {
              mymap.closePopup();
              var target_ = x.target;
              target_.setStyle({
                weight: 2,
                opacity: 1,
                color: "white",
                dashArray: "2",
                fillOpacity: 0.4,
              });
            }

            function event_feature(x, layer) {
              layer.on({
                mouseover: markfeature,
                mouseout: removefeature,
              });
            }

            data = data.filter(checknum);
            var date_now = new Date(data[0].Date);
            document.getElementById("range2").innerHTML =
              date_now.getMonth() +
              1 +
              "/" +
              (date_now.getDate() + 1) +
              "/" +
              date_now.getFullYear();

            data = Object.assign(
              new Map(data.map((d) => [d.Country, d.Status]))
            );

            $L.geoJson(world_map, {
              style: mapstyle,
              onEachFeature: event_feature,
            }).addTo(mymap);
          });
        });
      });
    }
    function bbb() {
      var margin = { top: 20, left: 75, bottom: 50, right: 50 },
        width = 1150 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

      var svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr(
          "transform",
          "translate(" + margin.left + ", " + margin.top + ")"
        );

      var x = d3.scaleBand();
      var y = d3.scaleLinear();

      var delay = function (d, i) {
        return i * 15;
      };

      var defa, top5, bottom5, current_option;
      var current, sortMode, filterMode;

      var initial_s;

      d3.json("mydataj3.json", (d) => {
        return {
          Country: d.Country,
          all_weeks: +d["all"],
        };
      }).then((data) => {
        defa = data;
        console.log(defa);
        function updatev() {
          current_option = document.getElementById("close_type").value;
          console.log(current_option);
          if (current_option == "all_d") {
            top5 = data
              .sort((a, b) => d3.descending(a.all, b.all))
              .slice(0, 13);
            bottom5 = data
              .sort((a, b) => d3.ascending(a.all, b.all))
              .slice(0, 13);
          }
          if (current_option == "full") {
            top5 = data
              .sort((a, b) => d3.descending(a.full, b.full))
              .slice(0, 13);
            bottom5 = data
              .sort((a, b) => d3.ascending(a.full, b.full))
              .slice(0, 13);
          }
          if (current_option == "partial") {
            top5 = data
              .sort((a, b) => d3.descending(a.partial, b.partial))
              .slice(0, 13);
            bottom5 = data
              .sort((a, b) => d3.ascending(a.partial, b.partial))
              .slice(0, 13);
          }

          filter(filterMode);
          sort(sortMode);
          redraw();
        }

        document
          .getElementById("close_type")
          .addEventListener("change", updatev);
        //🎒 set earth using array.find here
        //earth = data.find( d=> d.name == 'EARTH' );

        initial_s = data
          .sort((a, b) => d3.ascending(a.Country, b.Country))
          .slice(0, 13);
        console.log(initial_s);

        //🎒 set closer to the 4 planets closest to the sun using array.slice here
        top5 = data.sort((a, b) => d3.descending(a.all, b.all)).slice(0, 13);

        //🎒 set farther to the 4 planets farthest from the sun using array.slice here
        bottom5 = data.sort((a, b) => d3.ascending(a.all, b.all)).slice(0, 13);

        filter("#defa");

        toggleFilter("#defa");

        draw();
      });

      //sort event handlers
      d3.select("#name").on("click", () => {
        sort("#name");
        transition();
        toggleSort("#name");
      });

      //🎒 implement click events to sort by temperature and gravity here (same as click event for distance)
      d3.select("#value_asc").on("click", () => {
        sort("#value_asc");
        transition();
        toggleSort("#value_asc");
      });
      ////
      d3.select("#value_desc").on("click", () => {
        sort("#value_desc");
        transition();
        toggleSort("#value_desc");
      });

      //filter event handlers
      d3.select("#defa").on("click", () => {
        filter("#defa");
        sort(sortMode);

        toggleSort(sortMode);
        toggleFilter("#defa");

        redraw();
      });

      d3.select("#reset").on("click", () => {
        filter("#defa");
        //sort('#name');

        d3.selectAll(".sort").style("background-color", "#eee");
        toggleFilter("#defa");

        redraw();
      });

      d3.select("#t5").on("click", () => {
        filter("#t5");

        sort(sortMode);

        toggleSort(sortMode);
        toggleFilter("#t5");

        redraw();
      });

      d3.select("#b5").on("click", () => {
        filter("#b5");
        sort(sortMode);

        toggleSort(sortMode);
        toggleFilter("#b5");

        redraw();
      });

      // d3.select('input')
      // .on('change', () => {

      //   sort(sortMode);
      //   toggleSort(sortMode);

      //   redraw();
      // });

      function filter(mode) {
        if (mode === "#defa") {
          current = JSON.parse(JSON.stringify(initial_s));
        } else if (mode === "#t5") {
          current = JSON.parse(JSON.stringify(top5));
        } else if (mode === "#b5") {
          current = JSON.parse(JSON.stringify(bottom5));
        }
        filterMode = mode;
      }

      function sort(mode) {
        if (mode === "#name") {
          current.sort((a, b) => d3.ascending(a.Country, b.Country));
        } else if (mode === "#value_asc") {
          if (document.getElementById("close_type").value == "all_d") {
            current.sort((a, b) => d3.ascending(a.all, b.all));
          }
          if (document.getElementById("close_type").value == "partial") {
            current.sort((a, b) => d3.ascending(a.partial, b.partial));
          }
          if (document.getElementById("close_type").value == "full") {
            current.sort((a, b) => d3.ascending(a.full, b.full));
          }
        } else if (mode === "#value_desc") {
          if (document.getElementById("close_type").value == "all_d") {
            current.sort((a, b) => d3.descending(a.all, b.all));
          }
          if (document.getElementById("close_type").value == "partial") {
            current.sort((a, b) => d3.descending(a.partial, b.partial));
          }
          if (document.getElementById("close_type").value == "full") {
            current.sort((a, b) => d3.descending(a.full, b.full));
          }
        }
        x.domain(current.map((d) => d.Country));
        sortMode = mode;
      }

      function toggleSort(id) {
        d3.selectAll(".sort").style("background-color", "#eee");
        d3.select(id).style("background-color", "#dadbec");
      }

      //🎒 implement toggleFilter to highlight buttons with class .filter here (same as toggleSort with class .sort)
      function toggleFilter(id) {
        d3.selectAll(".filter").style("background-color", "#eee");
        d3.select(id).style("background-color", "#dadbec");
      }
      ///

      function redraw() {
        //update scale
        console.log(current);
        x.domain(current.map((d) => d.Country));
        var transition = svg
          .transition() //set-up the transition
          .duration(750);

        var xAxis;
        xAxis = d3.axisBottom().scale(x);

        transition //transition the axis
          .select("#x-axis")
          .call(xAxis);
        if (document.getElementById("close_type").value == "all_d") {
          //console.log(d3.max(current, d => d.all)+20)

          y.domain([0, d3.max(current, (d) => d.all)]).range([height, 0]);

          var yAxis = d3.axisLeft().scale(y).ticks(5, "d");

          transition //transition the axis
            .select("#y-axis")
            .call(yAxis);
          //////////////////////////////
          // DATA JOIN FOR BARS.
          var bars = svg.selectAll(".bar").data(current, (d) => d.Country);

          // UPDATE.
          bars
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country))
            .attr("width", x.bandwidth());

          // ENTER.
          bars
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.Country))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition()
            .duration(750)
            .attr("class", "bar")
            .attr("x", (d) => x(d.Country))
            .attr("y", (d) => y(d.all))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.all));

          // EXIT.
          bars.exit().transition().duration(750).style("opacity", 0).remove();

          ////////////////////////////////
          // DATA JOIN FOR NAMES.
          var name = svg.selectAll(".name").data(current, (d) => d.Country);

          // UPDATE.
          name
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2);

          // ENTER.
          name
            .enter()
            .append("text")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.all) + (height - y(d.all)) / 2)
            .style("opacity", 0)
            .merge(name)
            .transition()
            .duration(1000)
            .text((d) => d.Country)
            .attr("class", "name")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.all) + (height - y(d.all)) / 2)
            .style("opacity", 1);

          name.exit().transition().duration(750).style("opacity", 0).remove();
        }
        if (document.getElementById("close_type").value == "partial") {
          //console.log(d3.max(current, d => d.all)+20)

          y.domain([0, d3.max(current, (d) => d.partial)]).range([height, 0]);

          yAxis = d3.axisLeft().scale(y).ticks(5, "d");

          transition //transition the axis
            .select("#y-axis")
            .call(yAxis);
          ////////////////////////////////
          // DATA JOIN FOR BARS.
          bars = svg.selectAll(".bar").data(current, (d) => d.Country);

          // UPDATE.
          bars
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country))
            .attr("width", x.bandwidth());

          // ENTER.
          bars
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.Country))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition()
            .duration(750)
            .attr("class", "bar")
            .attr("x", (d) => x(d.Country))
            .attr("y", (d) => y(d.partial))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.partial));

          // EXIT.
          bars.exit().transition().duration(750).style("opacity", 0).remove();

          ////////////////////////////////
          // DATA JOIN FOR NAMES.
          name = svg.selectAll(".name").data(current, (d) => d.Country);

          // UPDATE.
          name
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2);

          // ENTER.
          name
            .enter()
            .append("text")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.partial) + (height - y(d.partial)) / 2)
            .style("opacity", 0)
            .merge(name)
            .transition()
            .duration(1000)
            .text((d) => d.Country)
            .attr("class", "name")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.partial) + (height - y(d.partial)) / 2)
            .style("opacity", 1);

          name.exit().transition().duration(750).style("opacity", 0).remove();
        }
        if (document.getElementById("close_type").value == "full") {
          //console.log(d3.max(current, d => d.all)+20)

          y.domain([0, d3.max(current, (d) => d.full)]).range([height, 0]);

          yAxis = d3.axisLeft().scale(y).ticks(5, "d");

          transition //transition the axis
            .select("#y-axis")
            .call(yAxis);
          ////////////////////////////////
          // DATA JOIN FOR BARS.
          bars = svg.selectAll(".bar").data(current, (d) => d.Country);

          // UPDATE.
          bars
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country))
            .attr("width", x.bandwidth());

          // ENTER.
          bars
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.Country))
            .attr("y", y(0))
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition()
            .duration(750)
            .attr("class", "bar")
            .attr("x", (d) => x(d.Country))
            .attr("y", (d) => y(d.full))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.full));

          // EXIT.
          bars.exit().transition().duration(750).style("opacity", 0).remove();

          ////////////////////////////////
          // DATA JOIN FOR NAMES.
          name = svg.selectAll(".name").data(current, (d) => d.Country);

          // UPDATE.
          name
            .transition()
            .duration(750)
            .delay(delay)
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2);

          // ENTER.
          name
            .enter()
            .append("text")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.full) + (height - y(d.full)) / 2)
            .style("opacity", 0)
            .merge(name)
            .transition()
            .duration(1000)
            .text((d) => d.Country)
            .attr("class", "name")
            .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
            .attr("y", (d) => y(d.full) + (height - y(d.full)) / 2)
            .style("opacity", 1);

          name.exit().transition().duration(750).style("opacity", 0).remove();
        }

        // EXIT.
      }

      function transition() {
        var transition = svg.transition().duration(750);

        transition
          .selectAll(".bar")
          .delay(delay)
          .attr("x", (d) => x(d.Country));

        transition
          .selectAll(".name")
          .delay(delay)
          .attr("x", (d) => x(d.Country) + x.bandwidth() / 2);

        x.domain(current.map((d) => d.Country));
        transition = svg
          .transition() //set-up the transition
          .duration(750);

        var xAxis;
        xAxis = d3.axisBottom().scale(x);

        transition //transition the axis
          .select("#x-axis")
          .call(xAxis);
      }

      function draw() {
        x.domain(current.map((d) => d.Country))
          .range([0, width])
          .paddingInner(0.2);

        y.domain([0, d3.max(current, (d) => d.all) + 20]).range([height, 0]);

        svg
          .selectAll(".bar")
          .data(current, (d) => d.Country)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.Country))
          .attr("y", (d) => y(d.all))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.all));

        svg
          .selectAll(".name")
          .data(current, (d) => d.Country)
          .enter()
          .append("text")
          .text((d) => d.Country)
          .attr("class", "name")
          .attr("x", (d) => x(d.Country) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.all) + (height - y(d.all)) / 2);

        var xAxis;
        xAxis = d3.axisBottom().scale(x);

        svg
          .append("g")
          .attr("id", "x-axis")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        var yAxis = d3.axisLeft().scale(y).ticks(5, "d");

        svg.append("g").attr("id", "y-axis").attr("class", "axis").call(yAxis);

        svg
          .append("text")
          .attr("x", 460)
          .attr("y", 320)
          .append("tspan")
          .text("Country");

        svg
          .append("text")
          .attr("x", 160)
          .attr("y", 5)
          // .append('tspan').text('Electricity-Total Wind Production by Country(2012)')
          .style("font-size", "1.4em");

        svg
          .append("text")
          .attr("x", -height / 2)
          .attr("y", -margin.left * 0.7)
          .attr("transform", "rotate(-90)")
          .attr("class", "ylabel")
          .append("tspan")
          .text("Duration of school closure(in weeks)")
          .style("baseline-shift", "super")
          .style("font-size", "0.9em");
      }
    }
    function draw_tree() {
      var status_data = {
        name: "Top",
        parent: "null",
        children: [
          {
            name: "Closed due to COVID-19",
            parent: "Top",
            children: [
              {
                name: "Africa (Sub-Saharan) ",
                parent: "Closed due to COVID-19",
                children: [
                  {
                    name: "Sao Tome and Principe",
                    parent: "Africa (Sub-Saharan) ",
                  },
                  { name: "Uganda", parent: "Africa (Sub-Saharan) " },
                ],
              },
              {
                name: "Asia (Central and Southern)",
                parent: "Closed due to COVID-19",
                children: [
                  { name: "Sri Lanka", parent: "Asia (Central and Southern)" },
                ],
              },
              {
                name: "Asia (Eastern and South-eastern)",
                parent: "Closed due to COVID-19",
                children: [
                  {
                    name: "Brunei Darussalam",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Myanmar",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Philippines",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                ],
              },
              {
                name: "Latin America and the Caribbean",
                parent: "Closed due to COVID-19",
                children: [
                  {
                    name: "Bahamas",
                    parent: "Latin America and the Caribbean",
                  },
                  { name: "Belize", parent: "Latin America and the Caribbean" },
                  {
                    name: "Barbados",
                    parent: "Latin America and the Caribbean",
                  },
                  { name: "Cuba", parent: "Latin America and the Caribbean" },
                  {
                    name: "Dominica",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Grenada",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Jamaica",
                    parent: "Latin America and the Caribbean",
                  },
                ],
              },
              {
                name: "Oceania",
                parent: "Closed due to COVID-19",
                children: [{ name: "Fiji", parent: "Oceania" }],
              },
            ],
          },
          {
            name: "Partially open",
            parent: "Top",
            children: [
              {
                name: "Africa (Sub-Saharan) ",
                parent: "Partially open",
                children: [
                  { name: "Cameroon", parent: "Africa (Sub-Saharan) " },
                  { name: "Ghana", parent: "Africa (Sub-Saharan) " },
                  { name: "Seychelles", parent: "Africa (Sub-Saharan) " },
                  { name: "South Africa", parent: "Africa (Sub-Saharan) " },
                ],
              },
              {
                name: "Asia (Central and Southern)",
                parent: "Partially open",
                children: [
                  {
                    name: "Afghanistan",
                    parent: "Asia (Central and Southern)",
                  },
                  { name: "Bangladesh", parent: "Asia (Central and Southern)" },
                  { name: "India", parent: "Asia (Central and Southern)" },
                  { name: "Kyrgyzstan", parent: "Asia (Central and Southern)" },
                  { name: "Nepal", parent: "Asia (Central and Southern)" },
                  { name: "Pakistan", parent: "Asia (Central and Southern)" },
                ],
              },
              {
                name: "Asia (Eastern and South-eastern)",
                parent: "Partially open",
                children: [
                  {
                    name: "Indonesia",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Cambodia",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Republic of Korea",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Lao PDR",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Mongolia",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Malaysia",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                  {
                    name: "Viet Nam",
                    parent: "Asia (Eastern and South-eastern)",
                  },
                ],
              },
              {
                name: "Latin America and the Caribbean",
                parent: "Partially open",
                children: [
                  {
                    name: "Argentina",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Bolivia (Plurinational State of)",
                    parent: "Latin America and the Caribbean",
                  },
                  { name: "Brazil", parent: "Latin America and the Caribbean" },
                  { name: "Chile", parent: "Latin America and the Caribbean" },
                  {
                    name: "Colombia",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Costa Rica",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Dominican Republic",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Ecuador",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Guatemala",
                    parent: "Latin America and the Caribbean",
                  },
                  { name: "Guyana", parent: "Latin America and the Caribbean" },
                  {
                    name: "Honduras",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Saint Kitts and Nevis",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Saint Lucia",
                    parent: "Latin America and the Caribbean",
                  },
                  { name: "Mexico", parent: "Latin America and the Caribbean" },
                  { name: "Panama", parent: "Latin America and the Caribbean" },
                  { name: "Peru", parent: "Latin America and the Caribbean" },
                  {
                    name: "Paraguay",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "El Salvador",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Suriname",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Trinidad and Tobago",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Saint Vincent and the Grenadines",
                    parent: "Latin America and the Caribbean",
                  },
                  {
                    name: "Venezuela",
                    parent: "Latin America and the Caribbean",
                  },
                ],
              },
              {
                name: "Northern America and Europe",
                parent: "Partially open",
                children: [
                  { name: "Bermuda", parent: "Northern America and Europe" },
                  { name: "Serbia", parent: "Northern America and Europe" },
                  { name: "Ukraine", parent: "Northern America and Europe" },
                  {
                    name: "United States of America",
                    parent: "Northern America and Europe",
                  },
                ],
              },
              {
                name: "Oceania",
                parent: "Partially open",
                children: [
                  { name: "Australia", parent: "Oceania" },
                  { name: "New Zealand", parent: "Oceania" },
                ],
              },
              {
                name: "Western Asia and Northern Africa",
                parent: "Partially open",
                children: [
                  {
                    name: "Bahrain",
                    parent: "Western Asia and Northern Africa",
                  },
                  {
                    name: "Kuwait",
                    parent: "Western Asia and Northern Africa",
                  },
                  { name: "Oman", parent: "Western Asia and Northern Africa" },
                  { name: "Qatar", parent: "Western Asia and Northern Africa" },
                  {
                    name: "Saudi Arabia",
                    parent: "Western Asia and Northern Africa",
                  },
                ],
              },
            ],
          },
        ],
      };
      var mytree = d3.tree().size([1800, 660]);
      var svg = d3
        .select("#tree_graph")
        .append("svg")
        .attr("width", 960)
        .attr("height", 1800)
        .append("g")
        .attr("transform", "translate(30,0)");

      var tree_root = d3.hierarchy(status_data);

      redraw_tree(tree_root);

      function redraw_tree() {
        var tree_nodes = mytree(tree_root).descendants();
        var tree_links = mytree(tree_root).descendants().slice(1);
        console.log(tree_links);

        var initial_state = svg
          .selectAll("g.tnode")
          .data(tree_nodes, (d, i) => {
            if (d.key) {
              return d.key;
            } else {
              return i;
            }
          })
          .enter()
          .append("g");

        initial_state
          .append("circle")
          .attr("r", 10)
          .attr("fill", "steelblue")
          .attr("class", "tnode")
          .attr("transform", (d) => {
            return "translate(" + d.y + "," + d.x + ")";
          });

        initial_state
          .append("text")
          .text((d) => {
            return d.data.name;
          })
          .attr("text-anchor", (d) => {
            if (d.children) {
              return "end";
            } else {
              return "start";
            }
          })
          .attr("dx", (d) => {
            if (d.children) {
              return "-0.5em";
            } else {
              return "0.6em";
            }
          })
          .attr("dy", "0.2em")
          .attr("font-size", "15")
          .attr("transform", (d) => {
            return "translate(" + d.y + "," + d.x + ")";
          });

        svg
          .selectAll("g.tlink")
          .data(tree_links)
          .enter()
          .insert("path", "g")
          .attr("class", "tlink")
          .attr("d", (d) => {
            return (
              "M" +
              d.y +
              "," +
              d.x +
              "C" +
              (d.y + d.parent.y) / 2 +
              "," +
              d.x +
              " " +
              (d.y + d.parent.y) / 2 +
              "," +
              d.parent.x +
              " " +
              d.parent.y +
              "," +
              d.parent.x
            );
          });
      }
    }

    draw_tree();

    aaa();
    ccc();
    bbb();
    this.draw_pie();
    // draw_pie();
  },
};
</script>

<style scoped>
>>> #leafmap {
  width: 1000px;
  height: 500px;
}

>>> .legen {
  width: 18px;
  height: 18px;

  display: inline-block;
  opacity: 0.7;
}

>>> .answer2 .axis path,
.axis line {
  fill: none;
  stroke: black;
  shape-rendering: crispEdges;
}

>>> .answer2 .axis text {
  font-family: Courier;
  font-size: 0.85em;
}

>>> .answer2 text {
  font-family: Courier;
  font-size: 0.65em;
}

>>> .answer2 div.commands {
  font-family: Courier;
  font-size: 0.85em;
  font-weight: bold;
  text-align: center;
  cursor: default;
  user-select: none;
}

>>> .answer2 svg {
  display: block;
  margin: auto;
  background-color: #fafafa;
}

>>> .answer2 .bar {
  fill: #dadbec;
}

>>> .answer2 .bar:hover {
  fill: #9e9ac9;
}

>>> .answer2 text.xlabel {
  text-anchor: middle;
}

>>> .answer2 text.ylabel {
  text-anchor: middle;
  alignment-baseline: central;
}

>>> .answer2 text.name {
  font-weight: bold;
  text-anchor: middle;
  alignment-baseline: central;
}

>>> .answer2 .sort {
  border-radius: 3px;
  background-color: #eee;
  display: inline-block;
  cursor: default;
}

>>> .answer2 .sort,
label {
  font-family: Courier;
  color: #444;
  padding: 5px;
  margin: 5px;
}

>>> .answer2 label {
  vertical-align: text-bottom;
}

>>> .answer2 .filter {
  border-radius: 3px;
  background-color: #eee;
  padding: 5px;
  margin: 5px;
  color: #444;
  text-align: left;
  display: inline-block;
  cursor: default;
}

>>> .tlink {
  fill: none;
  stroke: #ccc;
  stroke-width: 1.5px;
}

>>> .tlink:hover {
  stroke: coral;
  stroke-width: 5.5px;
}
</style>