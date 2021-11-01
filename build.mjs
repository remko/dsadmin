#!/usr/bin/env node
/* eslint-env node */

import esbuild from "esbuild";
import process from "process";
import { createServer } from "http";
import glob from "glob";
import child_process from "child_process";
import fs from "fs";

let watch = false;
let test = false;
let coverage = false;
for (const arg of process.argv.slice(2)) {
  switch (arg) {
    case "--watch":
      watch = true;
      break;
    case "--test":
      test = true;
      break;
    case "--coverage":
      coverage = true;
      break;
  }
}

const dev = watch;

const buildOptions = {
  entryPoints: ["src/index.tsx"],
  logLevel: "info",
  bundle: true,
  outdir: "public/dist",
  minify: !dev,
  sourcemap: dev,
  plugins: [],
};

if (test) {
  const runTests = () => {
    // Slower, more convenient alternative:
    //    spawn("npm", ["exec", "mocha", ".esbuild-test"], ...
    const testBin = "node_modules/.bin/mocha";
    child_process.spawn(
      coverage ? "node_modules/.bin/nyc" : testBin,
      (coverage ? [testBin] : []).concat([".esbuild-test/**/*.test.js"]),
      {
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_OPTIONS: "--enable-source-maps",
        },
      },
    );
  };
  fs.rmSync(".esbuild-test", { recursive: true, force: true });
  esbuild
    .build({
      bundle: true,
      sourcemap: true,
      platform: "node",
      outdir: ".esbuild-test",
      entryPoints: glob.sync("src/**/*.test.[jt]s"),
      watch: watch
        ? {
            onRebuild: (error) => {
              if (!error) runTests();
            },
          }
        : undefined,
      external: ["chai", "lodash"],
    })
    .then(runTests);
} else if (watch) {
  const clients = [];
  esbuild.build({
    ...buildOptions,
    banner: {
      js: '(() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();',
    },
    watch: {
      onRebuild(error) {
        clients.forEach((res) => res.write("data: update\n\n"));
        clients.length = 0;
        if (error) {
          console.error(error);
        }
      },
    },
  });
  createServer((req, res) => {
    return clients.push(
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        Connection: "keep-alive",
      }),
    );
  }).listen(8082);
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}
