#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const static = require("node-static");
const process = require("process");
const http = require("http");
const path = require("path");
const proxy = require("http2-proxy");
const fs = require("fs");
const jsesc = require("jsesc");
const yargs = require("yargs/yargs");
const { exit } = require("yargs");

const publicDir = path.join(__dirname, "..", "public");

const args = yargs(process.argv)
  .option("project", {
    type: "string",
    default: process.env.DATASTORE_PROJECT_ID,
    description:
      "Datastore project ID. Defaults to DATASTORE_PROJECT_ID environment variable.",
    demandOption: true,
  })
  .option("datastore-emulator-host", {
    type: "string",
    default: process.env.DATASTORE_EMULATOR_HOST || "localhost:8081",
    description:
      "Datastore emulator hostname & port. Defaults to DATASTORE_EMULATOR_HOST environment variable.",
    demandOption: true,
  })
  .option("port", {
    type: "number",
    default: 8080,
    description: "Port to listen on",
  }).argv;

const emulatorHost = args.datastoreEmulatorHost.split(":");
if (emulatorHost.length != 2) {
  console.error("Invalid emulator host");
  exit(-1);
}
emulatorHost[1] = parseInt(emulatorHost[1], 10);

const dsadminEnv = {
  DATASTORE_PROJECT_ID: args.project,
};

const index = fs
  .readFileSync(path.join(publicDir, "index.html"))
  .toString()
  .replace(
    "<body>",
    `<body><script>DSADMIN_ENV = ${jsesc(dsadminEnv, {
      isScriptContext: true,
    })}</script>`,
  );

function serveIndex(req, res) {
  res.writeHead(200);
  res.end(index);
}

var file = new static.Server(publicDir);

console.log(
  `dsadmin (project ${args.project}) listening on http://localhost:${args.port}`,
);
http
  .createServer(function (req, res) {
    if (req.url.startsWith("/v1/")) {
      proxy.web(req, res, {
        hostname: emulatorHost[0],
        port: emulatorHost[1],
      });
    } else if (req.url === "/" || req.url === "/index.html") {
      serveIndex(req, res);
    } else {
      file.serve(req, res, function (e) {
        if (e && e.status === 404) {
          serveIndex(req, res);
        }
      });
    }
  })
  .listen(args.port);
