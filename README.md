# dsh — DevTool CLI

> A fast, interactive developer toolkit for the terminal. Runs entirely on your local machine — no network calls, no telemetry, no accounts.

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-261%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

---

## What is dsh?

`dsh` bundles the tools developers reach for every day — Base64, JWT decoding, JSON formatting, UUID generation, hashing, and more — into a single globally installable CLI. It works in two ways:

- **Interactive TUI** — arrow-key menus, text input forms, syntax-highlighted results
- **Pipe / stdin mode** — compose with Unix tools in scripts and one-liners

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Interactive TUI](#interactive-tui)
- [Pipe Mode](#pipe-mode)
  - [Encoding / Decoding](#encoding--decoding)
  - [Hashing](#hashing)
  - [JWT](#jwt)
  - [Generators](#generators)
  - [Format Converters](#format-converters)
  - [Date / Time](#date--time)
  - [String Utilities](#string-utilities)
- [All Pipe Aliases](#all-pipe-aliases)
- [Plugin System](#plugin-system)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

| Requirement | Version |
|---|---|
| Node.js | `>= 20.0.0` |
| npm | `>= 9.0.0` |
| OS | macOS, Linux, Windows (WSL recommended) |

---

## Installation

### Global install (recommended)

```bash
npm install -g dsh
```

### From source

```bash
git clone https://github.com/your-username/dsh.git
cd dsh
npm install
npm run build
npm link           # makes `devtool` available globally
```

---

## Quick Start

```bash
# Launch the interactive TUI
devtool

# Or use pipe mode directly
echo "hello world"   | devtool base64:encode
echo '{"name":"dsh"}' | devtool json:format
date +%s             | devtool ts:todate
```

---

## Interactive TUI

Run `devtool` with no arguments to launch the menu-driven interface.

```
DevTool CLI  —  developer toolkit

Select a category:
> Encoding / Decoding       Encode and decode strings using various formats
  Hashing                   Generate cryptographic hashes and HMAC signatures
  JWT Tools                 Decode and verify JSON Web Tokens
  Generators                Generate UUIDs, passwords, and random strings
  Format Converters         Convert between JSON, YAML, XML, and CSV formats
  Date / Time               Unix timestamp conversion, timezone conversion, and date diff
  String Utilities          Case conversion, regex testing, and line diff

[↑↓] Navigate  [Enter] Select  [Q] Quit
```

**Navigation flow:**

```
Main Menu  →  Sub Menu  →  Input Form  →  Result View
                ↑                              |
                └──────────── [B] Back ────────┘
```

**Result view keyboard shortcuts:**

| Key | Action |
|-----|--------|
| `C` | Copy result to clipboard |
| `R` | Retry with new input |
| `B` | Back to sub menu |
| `Q` | Quit |

---

## Pipe Mode

When stdin is not a TTY, `dsh` runs non-interactively. The first input field always comes from stdin. Additional fields are passed as `--flag value` arguments.

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Runtime error (bad input, parse failure, etc.) |
| `2` | Unknown alias or missing alias argument |

Add `--debug` for full stack traces on error.

---

### Encoding / Decoding

```bash
# Base64
echo "hello world"     | devtool base64:encode    # aGVsbG8gd29ybGQ=
echo "aGVsbG8gd29ybGQ=" | devtool base64:decode   # hello world

# URL encoding
echo "hello world & co" | devtool url:encode      # hello%20world%20%26%20co
echo "hello%20world"    | devtool url:decode       # hello world

# HTML encoding
echo '<script>alert("xss")</script>' | devtool html:encode
# &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

# Hex encoding
echo "hello"           | devtool hex:encode        # 68656c6c6f
echo "68656c6c6f"      | devtool hex:decode        # hello
```

---

### Hashing

```bash
echo "hello"  | devtool hash:md5      # 5d41402abc4b2a76b9719d911017c592
echo "hello"  | devtool hash:sha1     # aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
echo "hello"  | devtool hash:sha256   # 2cf24dba5fb0a30e26e83b2ac5b9e29e...
echo "hello"  | devtool hash:sha512   # 9b71d224bd62f3785d96d46ad3ea3d73...

# HMAC-SHA256 — pass the secret key as a flag
echo "my message" | devtool hash:hmac --key "my-secret-key"
```

---

### JWT

```bash
# Decode any JWT (no secret needed) — shows header, payload, expiry status
cat token.txt | devtool jwt:decode

# Verify signature with an HMAC secret
cat token.txt | devtool jwt:verify --secret "your-secret"

# Verify with an RSA public key
cat token.txt | devtool jwt:verify --secret "$(cat public.pem)"
```

Decoded output includes human-readable `iat_human`, `exp_human`, and an `(EXPIRED)` marker when applicable.

---

### Generators

```bash
# UUIDs
devtool gen:uuid4 < /dev/null          # 3f6c1e2a-9b4d-4f8a-a1e2-3c7f9d0b1234
devtool gen:uuid7 < /dev/null          # time-ordered UUID v7

# Generate multiple at once
echo "5" | devtool gen:uuid4           # 5 UUIDs, one per line

# Password (configurable via flags)
echo "" | devtool gen:password --length 24 --symbols yes --numbers yes --uppercase yes

# Random string with charset
echo "" | devtool gen:random --length 32 --charset hex
echo "" | devtool gen:random --length 16 --custom "ABCDEF0123456789"
```

---

### Format Converters

```bash
# JSON
echo '{"name":"dsh","version":1}' | devtool json:format    # pretty-print
echo '{ "a": 1 }'                 | devtool json:minify    # {"a":1}
echo '{"valid":true}'              | devtool json:validate  # Valid JSON

# YAML <-> JSON
cat config.yaml | devtool yaml:tojson
echo '{"name":"dsh"}' | devtool json:toyaml

# XML <-> JSON
cat data.xml    | devtool xml:tojson
echo '{"root":{"key":"val"}}' | devtool json:toxml

# CSV -> JSON
cat users.csv   | devtool csv:tojson
# Without header row:
cat data.csv    | devtool csv:tojson --header no
```

---

### Date / Time

```bash
# Unix timestamp -> human date
echo "1700000000"              | devtool ts:todate
# Local : 2023-11-15 03:43:20
# UTC   : 2023-11-14 22:13:20 UTC
# ISO   : 2023-11-14T22:13:20.000Z

# Also accepts milliseconds automatically
echo "1700000000000"           | devtool ts:todate

# Human date -> Unix timestamp
echo "2024-06-15 12:00:00"     | devtool ts:fromdate

# Current time as Unix timestamp
date +%s                       | devtool ts:todate

# Timezone conversion (IANA timezone names)
echo "2024-03-15 09:00:00" | devtool dt:tzconvert --from "America/New_York" --to "Asia/Kolkata"
# 2024-03-15 09:00:00 America/New_York
#   →
# 2024-03-15 19:30:00 Asia/Kolkata

# Date diff
echo "2024-01-01" | devtool dt:diff --end "2024-12-31"
# Total  : 365d 0h 0m 0s
# Days   : 365
# Hours  : 8760
# Minutes: 525600
```

---

### String Utilities

```bash
# Case conversion
echo "hello_world_foo"    | devtool str:camel    # helloWorldFoo
echo "helloWorld"         | devtool str:camel    # helloWorld (idempotent)

# Other targets via --target flag (default: camel)
echo "hello world"  | devtool str:camel --target pascal       # HelloWorld
echo "hello world"  | devtool str:camel --target snake        # hello_world
echo "hello world"  | devtool str:camel --target kebab        # hello-world
echo "hello world"  | devtool str:camel --target upper_snake  # HELLO_WORLD
echo "HelloWorld"   | devtool str:camel --target lower        # hello world

# Regex tester
echo "The quick brown fox" | devtool str:regex --pattern "\b\w{5}\b" --flags gi
# Returns JSON: { "totalMatches": 2, "matches": [...] }

# Line diff
echo "line1\nline2\nline3" | devtool str:diff --textB "line1\nchanged\nline3"
# Outputs unified diff format
```

---

## All Pipe Aliases

| Alias | Description |
|-------|-------------|
| `base64:encode` | Base64 encode |
| `base64:decode` | Base64 decode |
| `url:encode` | URL percent-encode |
| `url:decode` | URL percent-decode |
| `html:encode` | HTML entity encode |
| `html:decode` | HTML entity decode |
| `hex:encode` | Hex encode |
| `hex:decode` | Hex decode |
| `hash:md5` | MD5 hash |
| `hash:sha1` | SHA-1 hash |
| `hash:sha256` | SHA-256 hash |
| `hash:sha512` | SHA-512 hash |
| `hash:hmac` | HMAC-SHA256 (`--key`) |
| `jwt:decode` | Decode JWT |
| `jwt:verify` | Verify JWT (`--secret`) |
| `gen:uuid4` | Generate UUID v4 |
| `gen:uuid7` | Generate UUID v7 (time-ordered) |
| `gen:password` | Generate password (`--length --symbols --numbers --uppercase`) |
| `gen:random` | Random string (`--length --charset --custom`) |
| `json:format` | Pretty-print JSON (`--indent 2\|4\|tab`) |
| `json:minify` | Minify JSON |
| `json:validate` | Validate JSON |
| `yaml:tojson` | YAML to JSON |
| `json:toyaml` | JSON to YAML |
| `xml:tojson` | XML to JSON |
| `json:toxml` | JSON to XML |
| `csv:tojson` | CSV to JSON (`--header yes\|no`) |
| `ts:todate` | Unix timestamp to human date |
| `ts:fromdate` | Human date to Unix timestamp |
| `dt:tzconvert` | Timezone conversion (`--from --to`) |
| `dt:diff` | Date difference (`--end`) |
| `str:camel` | Case conversion (`--target camel\|pascal\|snake\|kebab\|upper_snake\|lower`) |
| `str:regex` | Regex tester (`--pattern --flags`) |
| `str:diff` | Line diff (`--textB`) |

---

## Plugin System

`dsh` supports community plugins. Any plugin installed at `~/.devtool/plugins/<name>/index.js` is automatically loaded at startup.

### Installing a community plugin

```bash
# Plugins are npm packages with the "devtool-plugin" keyword
mkdir -p ~/.devtool/plugins
cd ~/.devtool/plugins
npm install --prefix my-plugin some-devtool-plugin
```

### Writing your own plugin

A plugin is a compiled `.js` file with a default export that satisfies the `PluginManifest` interface:

```typescript
import type { PluginManifest } from 'dsh';

const plugin: PluginManifest = {
  id: "my-plugin",           // must be globally unique
  label: "My Plugin",
  description: "Does something useful",
  version: "1.0.0",
  utilities: [
    {
      id: "my-utility",
      label: "My Utility",
      description: "Transforms input somehow",
      pipeAlias: "my:util",  // must be globally unique
      inputs: [
        {
          name: "input",
          label: "Text input",
          type: "text",
          placeholder: "Enter something",
          required: true,
        },
      ],
      async run(inputs) {
        const result = inputs["input"].toUpperCase();
        return { result, language: "text" };
      },
    },
  ],
};

export default plugin;
```

Place the compiled output at `~/.devtool/plugins/my-plugin/index.js` and run `devtool` — your utility will appear in the TUI and be reachable via its `pipeAlias`.

> See [`PLUGIN_GUIDE.md`](PLUGIN_GUIDE.md) for the complete authoring contract, TypeScript types, and publishing guidance.

---

## Development Setup

```bash
# 1. Clone
git clone https://github.com/your-username/dsh.git
cd dsh

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Watch mode for development
npm run test:watch

# 5. Build
npm run build

# 6. Type check
npm run lint

# 7. Link globally to test the CLI
npm link
devtool --version
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build via tsup |
| `npm run dev` | Watch mode build |
| `npm test` | Run all 261 tests (vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run prepublishOnly` | Runs build before `npm publish` |

---

## Project Structure

```
dsh/
├── bin/
│   └── devtool.ts          # Entry point — pipe vs TUI dispatch
├── src/
│   ├── app.tsx             # Root Ink app — TUI state machine
│   ├── index.ts            # Library export (for plugin authors)
│   ├── core/
│   │   ├── PluginRegistry.ts
│   │   ├── PipeHandler.ts
│   │   └── ClipboardHelper.ts
│   ├── types/
│   │   └── plugin.ts       # Shared TypeScript interfaces
│   ├── ui/
│   │   ├── MainMenu.tsx
│   │   ├── SubMenu.tsx
│   │   ├── InputForm.tsx
│   │   ├── ResultView.tsx
│   │   └── ErrorView.tsx
│   └── plugins/
│       ├── encoding/       # base64, url, html, hex
│       ├── hashing/        # md5, sha, hmac
│       ├── jwt/            # decode, verify
│       ├── generators/     # uuid, password, randomString
│       ├── converters/     # json, yaml, xml, csv
│       ├── datetime/       # unixConverter, timezoneConverter, dateDiff
│       └── strings/        # caseConverter, regexTester, diffViewer
├── tests/                  # Mirrors src/plugins structure
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── package.json
```

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-new-utility
   ```

2. **Write your code.** Every utility must have a pure `run()` function and at least 3 unit tests.

3. **Run the full test suite:**
   ```bash
   npm test
   npm run lint
   ```

4. **Open a pull request** with a clear description of what you've added.

### Guidelines

- All utility `run()` functions must be **pure** — no I/O, no side effects, no `process` access
- No `any` types — use `unknown` with type guards for dynamic data
- Each new utility needs a `pipeAlias` that is globally unique
- Tests live in `tests/<plugin>/<utility>.test.ts`
- Keep the `PluginManifest` interface contract intact

### Reporting issues

Please use [GitHub Issues](https://github.com/your-username/dsh/issues) with:
- Your OS and Node.js version (`node --version`)
- The command you ran (or TUI steps)
- Expected vs actual behaviour

---

## License

[ISC](LICENSE) — free for personal and commercial use.

---

<div align="center">
  <sub>Built with Node.js · TypeScript · Ink · Runs 100% locally</sub>
</div>
