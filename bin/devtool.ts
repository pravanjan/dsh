import React from "react";
import { render } from "ink";
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

const argv = process.argv;
const debug = argv.includes("--debug");

// --version / -v
if (argv.includes("--version") || argv.includes("-v")) {
  console.log("1.0.0");
  process.exit(0);
}

// --help / -h
if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`
DevTool CLI — developer toolkit for the terminal

Usage:
  devtool                         Launch interactive TUI
  devtool <alias> [--flag value]  Pipe/stdin mode
  devtool --version               Print version
  devtool --help                  Show this help
  devtool --debug                 Enable debug output in pipe mode

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
  echo "hello"          | devtool base64:encode
  echo "aGVsbG8="       | devtool base64:decode
  cat token.txt         | devtool jwt:decode
  echo '{"a":1}'        | devtool json:format
  date +%s              | devtool ts:todate
  echo "hello_world"    | devtool str:camel
  echo "msg"            | devtool hash:hmac --key mysecret
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
