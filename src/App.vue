<template>
  <div id="app" class="mt-0">
    <Navbar :enabled="!awaitingInitialFetch" />
    <main class="container-fluid">
      <div v-if="awaitingInitialFetch" class="text-center">
        <svg
          id="loadingIcon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <g
            fill="none"
            stroke="#393939"
            stroke-width="5"
            stroke-linecap="square"
            stroke-linejoin="bevel"
          >
            <path
              d="M92 50a42 42 0 01-41 42M8 50A42 42 0 0149 8M30 70a28 28 0 0039 0m1-40a28 28 0 00-39 0M35 50a15 15 0 0015 15m15-15a15 15 0 00-15-15M19 81l11-11M70 30l11-11M19 50h16M65 50h16"
            />
          </g>
        </svg>
      </div>
      <router-view v-else :app="app"></router-view>
    </main>
    <Alert ref="alert" />
    <UpdateNotice
      v-if="app.appUpdateAvailable && this.$route.path != '/updates'"
    />
  </div>
</template>

<script>
import Vue from "vue";
import VueRouter from "vue-router";
import Navbar from "./components/general/Navbar.vue";
import SpellsPage from "./components/spells/SpellsPage.vue";
import StatsPage from "./components/general/StatsPage.vue";
import SettingsPage from "./components/general/SettingsPage.vue";
import OGLPage from "./components/general/OGLPage.vue";
import TipsPage from "./components/general/TipsPage.vue";
import AreasPage from "./components/general/AreasPage.vue";
import AboutPage from "./components/general/AboutPage.vue";
import NewsPage from "./components/general/NewsPage.vue";
import UpdatesPage from "./components/general/UpdatesPage.vue";
import ContentPage from "./components/general/ContentPage.vue";
import RulesPage from "./components/rules/RulesPage.vue";
import NotFound from "./components/general/NotFound.vue";
import Alert from "./components/general/Alert.vue";
import UpdateNotice from "./components/general/UpdateNotice.vue";

import ContentDatabase from "@/util/contentDatabase.js";
import SettingsDatabase from "@/util/settingsDatabase.js";
import constants from "@/util/constants.js";

const timeBetweenAppUpdateChecksInMs = 1000 * 60 * 60 * 1; // 1 hour
const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: SpellsPage },
    { path: "/spells/:urlSpellName", component: SpellsPage, props: true },
    { path: "/spells", redirect: "/" }, // This path was used in previous versions of the app, we leave this redirection to prevent 404'ing users
    { path: "/rules/:urlRuleName", component: RulesPage, props: true },
    { path: "/rules", component: RulesPage },
    { path: "/stats", component: StatsPage },
    { path: "/settings", component: SettingsPage },
    { path: "/tips", component: TipsPage },
    { path: "/areas", component: AreasPage },
    { path: "/about", component: AboutPage },
    { path: "/news", component: NewsPage },
    { path: "/content", component: ContentPage },
    { path: "/ogl", component: OGLPage },
    { path: "/updates", component: UpdatesPage },
    { path: "*", component: NotFound },
  ],
});

export default {
  name: "App",
  router,
  components: {
    Navbar,
    Alert,
    UpdateNotice,
  },
  data() {
    const contentDatabase = ContentDatabase.getFromStorageOrBlank();
    const settingsDatabase = SettingsDatabase.getFromStorageOrDefault();
    return {
      app: {
        contentDatabase,
        settingsDatabase,
        spells: [],
        rules: [],
        settings: settingsDatabase.getSettings(),
        appUpdateAvailable: false, // Whether an updated version of the app is awaiting activation
        editionModeOn: false, // Whether we should show the spell editor instead of the normal spell view
        alert: (msg, type, duration) =>
          this.$refs.alert.alert(msg, type, duration), // A helper function to display messages from anywhere
        reloadDatabase: function () {
          // Fetch the data from the contentDatabase again into this Vue component
          this.spells = this.contentDatabase.getSpells();
          this.rules = this.contentDatabase.getRules();
        },
      },
      awaitingInitialFetch: false, // If true, it means we're waiting for an AJAX request to populate the content database
      alertMessage: null,
      alertType: null,
      lastAppUpdateCheck: new Date(),
    };
  },
  methods: {
    // Let the app know that there's a new app version available
    notifyUpdate() {
      this.app.appUpdateAvailable = true;
    },
  },
  created() {
    window.vueApp = this; // Share the Vue app reference here so that the Service Worker can call notifyUpdate()
    if (this.app.contentDatabase.isEmpty()) {
      // If the database is empty, load the default content file(s)
      const defaultContentFileURLs =
        process.env.VUE_APP_DEFAULT_CONTENTFILES.split(",");
      this.awaitingInitialFetch = true;
      Promise.all(
        defaultContentFileURLs.map((url) => {
          console.log(url);
          this.app.contentDatabase.loadURL(url);
        })
      ).then(() => {
        this.app.reloadDatabase();
        this.awaitingInitialFetch = false;
      });
    } else {
      // If an existing database was loaded, ensure the SRD is up-to-date
      if (
        this.app.contentDatabase.data.sources.some(
          (s) => s.name == "SRD 5.1" && s.version < constants.srdVersion
        )
      ) {
        this.app.contentDatabase
          .loadURL("/srd.json")
          .then(() => {
            this.app.reloadDatabase();
          })
          .catch((err) => {
            this.showError(err);
          });
      } else {
        this.app.reloadDatabase();
      }
    }
  },
  watch: {
    $route: function () {
      /* Normally the browser would check for ServiceWorker updates every time the user
      navigates to a different page. But since this is a SPA, it only checks on application
      startup, so on the PWA it could take days to update. To fix that, we manually check
      every time the route changes. Limited to once every 1 hour since that's good enough. */
      if (
        new Date() - this.lastAppUpdateCheck >
        timeBetweenAppUpdateChecksInMs
      ) {
        this.lastAppUpdateCheck = new Date();
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            reg.update();
          }
        });
      }
    },
  },
  metaInfo: {
    title: "WeaveLore",
    meta: [
      {
        vmid: "description",
        name: "description",
        content:
          "WeaveLore is a free and open-source web application to browse D&D 5e spells. It's packed with features and includes a mobile app. Try it now!",
      },
      { vmid: "robots", name: "robots", content: "all" },
    ],
  },
};

Vue.directive("focus", {
  inserted(el) {
    el.focus();
  },
});
</script>

<style>
body {
  background-color: #1b1b1b !important;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  background-color: #1b1b1b !important;
  font-family: "Ubuntu", Helvetica, Arial, sans-serif !important;
}
@font-face {
  font-family: "Ubuntu";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local("Ubuntu Regular"), local("Ubuntu-Regular"),
    url(./fonts/ubuntu.woff2) format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
#loadingIcon {
  width: 120px;
  margin-top: 100px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
