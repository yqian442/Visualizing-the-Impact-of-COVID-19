<template>
  <div class="homebody">
    <h1>{{ msg }}</h1>

    <div>
      <!-- <b-table striped hover :items="data"></b-table> -->
    </div>
    <div
      id="map"
      class="
        map map-home
        leaflet-container
        leaflet-touch
        leaflet-fade-anim
        leaflet-grab
        leaflet-touch-drag
        leaflet-touch-zoom
      "
    ></div>
    <input
      id="slider1"
      style="width: 500px; margin-left: 330px; margin-top: 30px"
    />
    <span id="slider_date"></span>
    <div id="map_table">
      <table>
        <thead>
          <tr>
            <th>Country/Region</th>
            <th>GDP</th>
            <th>School Status</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>



<script>
import * as d3 from "d3";
import $L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "HomePage",
  props: {
    msg: String,
    // data: Object,
  },
  methods: {},
  mounted() {
    var data;
    d3.json('test_integrated.geojson').then(result => {
      data = result
    
    // var data = this.$store.state.countryGeoIntegratedData;
    // var data = this.data;
    // if (!data){
    //   console.log('2131')
    // }
    // console.log(data.features)
    const mapboxAccessToken =
      "pk.eyJ1Ijoic2hpaGFvbGluIiwiYSI6ImNrdjJiZmFjYTA4cjAycG9iZGUxMmw5bTMifQ.7aH7rV0sh3IvK4GgUABnUg";
    // set default value for slider
    d3.select("#slider1")
      .attr("type", "range")
      .attr("min", new Date("2020.02.01").getTime() / 1000)
      .attr("max", new Date("2021.11.05").getTime() / 1000)
      .attr("step", 86400)
      .attr("value", new Date("2020.02.01").getTime() / 1000);
    d3.select("#slider_date").text(new Date("2020.02.01").toDateString());
    /* Global variables for Map*/
    var cur_time = new Date(d3.select("#slider1").node().value * 1000);
    var map_filter_attr;

    // value formater section
    var gdp_format = d3.format("$.3~f");

    // initiate time bound
    // Therefore, if current slider time is still within the boundary,
    // do no need for the update the map.
    // #### Currently, we would disable this functionality since time bound is 1 if we use daily data
    // var time_low, time_upper

    /* Time Scaler Section */
    // TODO: ADD more cases
    var gdp_threshold = ["2019", "2020", "2021", "2022"].map(
      (v) => new Date(v)
    ),
    gdp_time = d3
      .scaleThreshold()
      .domain(gdp_threshold.slice(1))
      .range(gdp_threshold.map((v) => v.getFullYear()));

    var school_threshold = [
      0, 1581811200000, 1584316800000, 1586995200000, 1589587200000,
      1592265600000, 1594857600000, 1597536000000, 1600214400000, 1602806400000,
      1605484800000, 1608076800000, 1610755200000, 1613433600000, 1615852800000,
      1618531200000, 1621123200000, 1623801600000, 1626393600000, 1629043200000,
    ].map((v) => new Date(v)),
    school_time = d3
      .scaleThreshold()
      .domain(school_threshold.slice(1))
      .range(school_threshold.map((v) => v.getTime()));

    /* Color Scaler Section*/
    // TODO: Add more cases if needed
    // define color functions for different type of data
    var color_school = d3.scaleOrdinal(
        [
          "Closed due to COVID-19",
          "Partially open",
          "Academic break",
          "Fully open",
        ],
        d3.schemeRdBu[4]
      ),
      // color_seq = d3.scaleSequential(d3.interpolateBlues),
      color_seq_log = d3.scaleSequentialLog(d3.interpolateBlues),
      gdp_domain = { 2020: [0.932, 20893.75], 2021: [0.999, 22939.58] };

    // default configuate for the leaflet map
    var bounds = new $L.LatLngBounds(
        new $L.LatLng(-60, -180),
        new $L.LatLng(84, 180)
      ),
      map = $L.map("map", {
        center: bounds.getCenter(),
        zoom: 2,
        minZoom: 1.8,
        maxZoom: 6,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
      });
    // }).setView([37.8, -96], 2);
    function mapstyle(x) {
      /*TODO: ADD more cases */
      // feature dictionary with GeoJson Feature Collections

      let color;
      if (map_filter_attr == "gdp") {
        let input = gdp_time(cur_time);
        // time_low = gdp_time.invertExtent(input)[0]
        // time_upper = gdp_time.invertExtent(input)[1]
        color = x.properties.gdp[input]
          ? color_seq_log.domain(gdp_domain[input])(x.properties.gdp[input])
          : "#B6B6B6";
      } else if (map_filter_attr == "school") {
        let input = school_time(cur_time);
        // time_low = school_time.invertExtent(input)[0]
        // time_upper = school_time.invertExtent(input)[1]
        color = x.properties.school[input]
          ? color_school(x.properties.school[input])
          : "#B6B6B6";
      }
      color = color ? color : "#B6B6B6";
      return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "2",
        fillOpacity: 0.4,
      };
    }
    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
      });

      if (!$L.Browser.ie && !$L.Browser.opera && !$L.Browser.edge) {
        layer.bringToFront();
      }

      // update info box
      info.update(layer.feature.properties);
    }
    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      // update info box
      info.update();
    }
    // function zoomToFeature(e) {
    //   map.fitBounds(e.target.getBounds());
    // }
    function addTableRow(name) {
      // TODO: ADD more cases
      let props = data.features.filter((d) => d.properties.name == name)[0]
          .properties,
        gdp_txt = props.gdp[gdp_time(cur_time)]
          ? gdp_format(props.gdp[gdp_time(cur_time)])
          : "",
        school_txt = props.school[school_time(cur_time)]
          ? props.school[school_time(cur_time)]
          : "",
        table = d3.select("#map_table tbody");

      if (!table.select(`tr[name='${name}']`).node()) {
        let tmp_tr = table.append("tr").attr("name", name);
        tmp_tr.append("td").text(name);
        tmp_tr.append("td").text(gdp_txt);
        tmp_tr.append("td").text(school_txt);
        tmp_tr
          .append("td")
          .text("Remove")
          .on("click", function () {
            table.select(`tr[name='${name}']`).remove();
          });
      } else {
        let tds = table.select(`tr[name='${name}']`);
        tds.select("td:nth-child(2)").text(gdp_txt);
        tds.select("td:nth-child(3)").text(school_txt);
      }
    }
    function addToTable(e) {
      let props = e.target.feature.properties,
        table = d3.select("#map_table tbody"),
        length = table.selectAll("tr").nodes().length;
      // limit to 6 element
      if (length < 7) {
        addTableRow(props.name);
      }
    }
    function clickFeature(e) {
      // zoomToFeature(e)
      addToTable(e);
    }
    function event_feature(x, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature,
      });
    }
    var map_filter = $L.control({ position: "bottomleft" });
    map_filter.onAdd = function () {
      // ADD more cases
      this._selectbox = $L.DomUtil.create("div", "map_filter info");
      this._selectbox.innerHTML =
        "<h5>Dimension:</h5>" +
        "<select id='map_attr_filter'>" +
        "<option value='gdp'>GDP</option>" +
        "<option value='school'>School Status</option>" +
        "</select>";
      return this._selectbox;
    };
    map_filter.addTo(map);

    map_filter_attr = d3.select("#map_attr_filter").node().value;
    async function createTileLayer(){
      let titleLayer = await $L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
          mapboxAccessToken,
        {
          id: "mapbox/light-v9",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          tileSize: 512,
          zoomOffset: -1,
        }
      )
      titleLayer.addTo(map);
    }
    createTileLayer()
    var geojson;
    geojson = $L.geoJson(data, { style: mapstyle, onEachFeature: event_feature }).addTo(map)

    /* Info session*/

    var info = $L.control();
    info.onAdd = function () {
      // create a div with a class "info"
      this._div = $L.DomUtil.create("div", "info");
      // this.update();
      return this._div;
    };
    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
      if (props) {
        d3.select(".leaflet-top.leaflet-right .info").attr("hidden", null);
        this._div.innerHTML =
          "<h5>" +
          props.name +
          "</h5>" +
          (props.gdp[gdp_time(cur_time)]
            ? "<b>GDP:</b> " +
              gdp_format(props.gdp[cur_time.getFullYear()]) +
              " Billions of U.S.dollars <br/>"
            : "") +
          (props.school[school_time(cur_time)]
            ? "<b>School Status:</b>" + props.school[school_time(cur_time)]
            : "");
      } else {
        this._div.innerHTML = "";
        d3.select(".leaflet-top.leaflet-right .info").attr("hidden", "true");
      }
    };
    info.addTo(map);

    /* legend section */
    var legend = $L.control({ position: "bottomright" });
    legend.onAdd = function () {
      this._div = $L.DomUtil.create("div", "info legend");
      this.update();
      return this._div;
    };
    legend.update = function () {
      // TODO: ADD more cases
      if (map_filter_attr == "school") {
        this._div.innerHTML = "<h5>School Status:</h5>";
        let status = [
          "Closed due to COVID-19",
          "Partially open",
          "Academic break",
          "Fully open",
        ];
        for (let i = 0; i < status.length; i++) {
          this._div.innerHTML +=
            '<i style="background:' +
            color_school(status[i]) +
            '"></i> ' +
            status[i] +
            "<br>";
        }
      } else if (map_filter_attr == "gdp") {
        this._div.innerHTML =
          "<h5>GDP in " +
          cur_time.getFullYear() +
          ":</h5>" +"<p><em>(Billions of U.S.dollars)</em></p>"

        let color_gdp = color_seq_log.domain(
          gdp_domain[cur_time.getFullYear()]
        );
        for (let i = 4; i >= 0; i--) {
          this._div.innerHTML +=
            '<i style="background:' +
            color_gdp(10 ** i) +
            '"></i> ' +
            10 ** i +
            "<br>";
        }
      }
      this._div.innerHTML +=
        '<i style="background:#B6B6B6"></i> Not Applicable';
    };
    legend.addTo(map);

    // Update the map if attribute is changed
    d3.select("#map_attr_filter").on("change", async function () {
      map_filter_attr = this.value;
      console.log(this.value);
      await map.removeLayer(geojson);
      geojson = await $L.geoJson(data, {
        style: mapstyle,
        onEachFeature: event_feature,
      }).addTo(map);

      // update legend
      legend.update();
    });

    // Update the map if the time is changed
    d3.select("#slider1").on("change", async function () {
      cur_time = new Date(this.value * 1000);
      d3.select("#slider_date").text(cur_time.toDateString());
      // if (cur_time < time_low | cur_time >= time_upper) {
      // map.removeLayer(geojson)
      // geojson = L.geoJson(data, { style: mapstyle, onEachFeature: event_feature }).addTo(map)
      // }

      await map.removeLayer(geojson);
      geojson = await $L.geoJson(data, {
        style: mapstyle,
        onEachFeature: event_feature,
      }).addTo(map);

      // update table
      let table = d3.select("#map_table tbody");
      for (let i = 1; i <= table.selectAll("tr").nodes().length; i++) {
        addTableRow(table.select(`tr:nth-child(${i})`).attr("name"));
      }
      // update legend
      legend.update();
    });
    })
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
.map-home {
  /* height: 500px;
                width: 600px; */
  height: 30vw;
  width: 95vw;
  /* margin-top: 50px; */
  margin-bottom: 20px;
  display: inline-block;
}

.info {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.info h5 {
  margin: 0 0 5px;
  color: #777;
}

.legend {
  line-height: 18px;
  color: #555;
}

.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}

#map_table {
  margin: auto;
  height: 400px;
  margin-top: 10px;
  text-align: center;
  padding: 10px;
  font-size: 15px;
  font-family: Cuprum;
  line-height: 30px;
  letter-spacing: 5px;
}

#map_table table tr td,
#map_table table tr th {
  border: 1px solid black;
  padding: 10px;
  width: 100px;
  height: 20px;
}
</style>
