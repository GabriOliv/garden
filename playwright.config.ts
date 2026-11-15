import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4400/garden/";

export default defineConfig({
  testDir: "./tests",
  reporter: "list",
  forbidOnly: !!process.env.CI,
  use: { baseURL },
  projects: [
    {
      name: "site",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command:
      "npx docusaurus serve --dir build-test --port 4400 --host 127.0.0.1 --no-open",
    url: baseURL,
    reuseExistingServer: false,
  },
});
