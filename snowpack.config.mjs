/** @type {import("snowpack").SnowpackUserConfig } */
/* eslint-env node */

import proxy from "http2-proxy";

const emulatorHost = (
  process.env.DATASTORE_EMULATOR_HOST || "localhost:7080"
).split(":");
if (emulatorHost.length != 2) {
  throw Error(
    `Invalid DATASTORE_EMULATOR_HOST: ${process.env.DATASTORE_EMULATOR_HOST}`,
  );
}
emulatorHost[1] = parseInt(emulatorHost[1], 10);

export default {
  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    [
      "@snowpack/plugin-typescript",
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: "yarn pnpify tsc" } : {}),
      },
    ],
  ],
  routes: [
    {
      src: "/v1/.*",
      dest: (req, res) => {
        return proxy.web(req, res, {
          hostname: emulatorHost[0],
          port: emulatorHost[1],
        });
      },
    },
    { match: "routes", src: ".*", dest: "/index.html" },
  ],
  optimize: {
    bundle: true,
    minify: true,
    target: "es2020",
  },
  packageOptions: {},
  devOptions: {},
  buildOptions: {},
  env: {
    DATASTORE_PROJECT_ID: process.env.DATASTORE_PROJECT_ID || "dsadmin-dev",
  },
};
