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
    default:
      process.env.DATASTORE_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST ||
      "127.0.0.1:8081",
    description:
      "Datastore (or Firestore in Datastore mode) emulator hostname & port. Defaults to DATASTORE_EMULATOR_HOST or FIRESTORE_EMULATOR_HOST environment variable.",
    demandOption: true,
  })
  .option("database", {
    type: "string",
    default: "",
    description:
      "Database ID (Firestore emulator only). Defaults to the default database.",
  })
  .option("namespaces", {
    type: "string",
    default: "",
    description:
      "Comma-separated list of namespaces to show, for emulators that do not support listing namespaces (e.g. the Firestore emulator)",
  })
  .option("kinds", {
    type: "string",
    default: "",
    description:
      "Comma-separated list of kinds to show, for emulators that do not support listing kinds (e.g. the Firestore emulator). If not set, kinds are found by scanning all keys.",
  })
  .option("base-path", {
    type: "string",
    default: "",
    description: "Base HTTP path to serve the interface on",
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

const basePath = args.basePath;

const dsadminEnv = {
  DATASTORE_PROJECT_ID: args.project,
  DATASTORE_DATABASE_ID: args.database,
  NAMESPACES: args.namespaces.split(",").filter((ns) => ns !== ""),
  KINDS: args.kinds.split(",").filter((k) => k !== ""),
  BASE_PATH: basePath,
};

const index = fs
  .readFileSync(path.join(publicDir, "index.html"))
  .toString()
  .replace(
    "<body>",
    `<body><script>DSADMIN_ENV = ${jsesc(dsadminEnv, {
      isScriptContext: true,
    })}</script>`,
  )
  .replaceAll("{{BASE}}", basePath);

function serveIndex(req, res) {
  res.writeHead(200);
  res.end(index);
}

var file = new static.Server(publicDir);

console.log(
  `dsadmin (project ${args.project}${
    args.database !== "" ? `, database ${args.database}` : ""
  }) listening on http://localhost:${args.port}${basePath}`,
);
http
  .createServer(function (req, res) {
    if (!req.url.startsWith(basePath)) {
      res.writeHead(400);
      res.end("not found");
      return;
    }
    req.url = req.url.substring(basePath.length);
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
  .listen(args.port, () => {
    if (process.env.DSADMIN_NOTIFICATION_FD) {
      const notificationFD = parseInt(process.env.DSADMIN_NOTIFICATION_FD, 10);
      fs.writeSync(notificationFD, "\n");
      fs.closeSync(notificationFD);
    }
  });
