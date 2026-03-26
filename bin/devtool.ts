import React from "react";
import { render } from "ink";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { PluginRegistry } from "../src/core/PluginRegistry.js";
import { handlePipe } from "../src/core/PipeHandler.js";
import { App } from "../src/app.js";
import { encodingPlugin } from "../src/plugins/encoding/index.js";
import { hashingPlugin } from "../src/plugins/hashing/index.js";
import { jwtPlugin } from "../src/plugins/jwt/index.js";
import { generatorsPlugin } from "../src/plugins/generators/index.js";
import { convertersPlugin } from "../src/plugins/converters/index.js";
import { datetimePlugin } from "../src/plugins/datetime/index.js";
import { stringsPlugin } from "../src/plugins/strings/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
) as { version: string };

const argv = process.argv;
const debug = argv.includes("--debug");

// --version / -v
if (argv.includes("--version") || argv.includes("-v")) {
  console.log(pkg.version);
  process.exit(0);
}

// --help / -h
if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`
dsh — developer toolkit for the terminal

Usage:
  dsh                         Launch interactive TUI
  dsh <alias> [--flag value]  Pipe/stdin mode
  dsh --version               Print version
  dsh --help                  Show this help
  dsh --debug                 Enable debug output in pipe mode

Pipe aliases:
  Encoding    base64:encode  base64:decode  url:encode    url:decode
              html:encode    html:decode    hex:encode    hex:decode

  Hashing     hash:md5       hash:sha1      hash:sha256   hash:sha512
              hash:hmac (--key <secret>)

  JWT         jwt:decode     jwt:verify (--secret <key>)

  Generators  gen:uuid4      gen:uuid7
              gen:password   gen:random

  Converters  json:format    json:minify    json:validate
              yaml:tojson    json:toyaml
              xml:tojson     json:toxml     csv:tojson

  DateTime    ts:todate      ts:fromdate
              dt:tzconvert (--from <tz> --to <tz>)
              dt:diff (--end <date>)

  Strings     str:camel      str:regex (--pattern <re> --flags <gi>)
              str:diff (--textB <text>)

Examples:
  echo "hello"          | dsh base64:encode
  echo "aGVsbG8="       | dsh base64:decode
  cat token.txt         | dsh jwt:decode
  echo '{"a":1}'        | dsh json:format
  date +%s              | dsh ts:todate
  echo "hello_world"    | dsh str:camel
  echo "msg"            | dsh hash:hmac --key mysecret
`.trim());
  process.exit(0);
}

// Build registry
const registry = new PluginRegistry();

for (const plugin of [
  encodingPlugin,
  hashingPlugin,
  jwtPlugin,
  generatorsPlugin,
  convertersPlugin,
  datetimePlugin,
  stringsPlugin,
]) {
  registry.register(plugin);
}

// Load community plugins from ~/.devtool/plugins/
await registry.loadUserPlugins();

// Dispatch
if (!process.stdin.isTTY) {
  await handlePipe(registry, argv);
} else {
  const plugins = registry.getAllPlugins();
  const { waitUntilExit } = render(
    React.createElement(App, { plugins, debug })
  );
  await waitUntilExit();
}
