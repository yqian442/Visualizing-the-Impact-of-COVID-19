<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HomePage msg="Welcome to YYJS" :data="geodata" /> -->
    <HomePage msg="Welcome to YYJS"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HomePage from "@/components/Homepage.vue";
// import * as d3 from "d3";


export default {
  name: "Home",
  components: {
    HomePage,
  },
  data: function () {
    return {
      geodata: undefined,
    };
  },
  mounted: function () {
    // console.log("mounted home page data.");
    // if (!this.$store.state.countryGeoIntegratedData) {
    //   d3.json('test_integrated.geojson').then(result => {
    //     // var countriesData = topojson.feature(data, data.objects.countries)
    //     console.log("load integrated geo data from d3!")
    //     this.$store.commit("countryGeoIntegratedData", result);
    //     // this.geodata = result;
    //     // console.log(this.geodata.features)

    //   })
    // } else {
    //   // this.geodata = this.$store.state.countryGeoIntegratedData;
    //   // console.log(this.geodata.features)
    //   console.log("integrated geo Data set from store");
    // }
  },
};
</script>
