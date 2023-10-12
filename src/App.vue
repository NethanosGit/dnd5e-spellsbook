<template>
  <div id="app">
    <Navbar :enabled="true" />
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import VueRouter from "vue-router";
import Navbar from "./components/general/Navbar.vue";

const router = new VueRouter({
  mode: "history",
  routes: [{ path: "/" }],
});

export default {
  name: "App",
  router,
  components: {
    HelloWorld,
    Navbar,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
