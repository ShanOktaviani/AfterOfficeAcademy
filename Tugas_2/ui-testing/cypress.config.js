const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://opensource-demo.orangehrmlive.com",

    viewportWidth: 1440,
    viewportHeight: 900,

    video: true,

    screenshotOnRunFailure: true,

    defaultCommandTimeout: 10000,

    setupNodeEvents(on, config) {
      return config;
    },
  },
});
