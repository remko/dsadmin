#!/usr/bin/env node
/* eslint-env node */

import esbuild from "esbuild";
import process from "process";
import { createServer } from "http";

let watch = false;
for (const arg of process.argv.slice(2)) {
  switch (arg) {
    case "--watch":
      watch = true;
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

if (watch) {
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
