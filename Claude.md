# DevTool CLI — Project Generation Prompt

## 🎯 Project Overview

Build a **Node.js + TypeScript interactive CLI developer toolkit** called `dsh` that bundles the most frequently used developer utilities into a single globally installable npm package. The app must support both an **interactive TUI mode** (menu-driven, arrow keys) and **non-interactive pipe/stdin mode** for Unix scripting.
Every opration happens in client machine (cli) never makes call to any external server. All code written to stay inside your local machine. 

---

## 🧰 Tech Stack

| Concern | Library |
|---|---|
| Language | TypeScript 5.x |
| Runtime | Node.js >= 20 LTS |
| Build tool | `tsup` — zero-config TS bundler, outputs ESM, handles shebang |
| TUI / Rendering | `ink` + `react` — component-based terminal UI |
| Menu navigation | `ink-select-input` — arrow-key menu lists |
| Text input | `ink-text-input` — inline terminal text fields |
| Spinners | `ink-spinner` — async operation feedback |
| Syntax highlighting | `cli-highlight` — colored JSON/YAML/JWT output |
| Clipboard | `clipboardy` — copy result to clipboard |
| Hashing | Node built-in `crypto` — MD5, SHA-1/256/512, HMAC |
| JWT | `jsonwebtoken` + `@types/jsonwebtoken` |
| YAML | `js-yaml` + `@types/js-yaml` |
| CSV | `papaparse` + `@types/papaparse` |
| UUID | `uuid` + `@types/uuid` |
| Password generator | `generate-password` |
| Date/Time | `dayjs` |
| Diff | `diff` + `@types/diff` |
| Testing | `vitest` |
| Distribution | npm global install via `bin` field in package.json |

---

## 📁 Project Structure

```
devtool-cli/
├── bin/
│   └── devtool.ts                  # Entry point — detects pipe vs TUI mode
├── src/
│   ├── app.tsx                     # Root Ink app — main menu router
│   ├── core/
│   │   ├── PluginRegistry.ts       # Plugin discovery, registration, validation
│   │   ├── PipeHandler.ts          # Stdin pipe detection and routing
│   │   └── ClipboardHelper.ts      # Copy-to-clipboard wrapper
│   ├── types/
│   │   └── plugin.ts               # Shared TypeScript interfaces & types
│   ├── ui/
│   │   ├── MainMenu.tsx
│   │   ├── SubMenu.tsx
│   │   ├── InputForm.tsx
│   │   ├── ResultView.tsx
│   │   └── ErrorView.tsx
│   └── plugins/
│       ├── encoding/
│       │   ├── index.ts            # Plugin manifest
│       │   ├── base64.ts
│       │   ├── urlEncode.ts
│       │   ├── htmlEncode.ts
│       │   └── hexEncode.ts
│       ├── hashing/
│       │   ├── index.ts
│       │   ├── md5.ts
│       │   ├── sha.ts
│       │   └── hmac.ts
│       ├── jwt/
│       │   ├── index.ts
│       │   ├── decode.ts
│       │   └── verify.ts
│       ├── generators/
│       │   ├── index.ts
│       │   ├── uuid.ts
│       │   ├── password.ts
│       │   └── randomString.ts
│       ├── converters/
│       │   ├── index.ts
│       │   ├── jsonFormatter.ts
│       │   ├── yamlToJson.ts
│       │   ├── jsonToYaml.ts
│       │   ├── xmlToJson.ts
│       │   ├── jsonToXml.ts
│       │   └── csvToJson.ts
│       ├── datetime/
│       │   ├── index.ts
│       │   ├── unixConverter.ts
│       │   ├── timezoneConverter.ts
│       │   └── dateDiff.ts
│       └── strings/
│           ├── index.ts
│           ├── caseConverter.ts
│           ├── regexTester.ts
│           └── diffViewer.ts
├── tests/
│   ├── encoding/
│   ├── hashing/
│   ├── jwt/
│   ├── generators/
│   ├── converters/
│   ├── datetime/
│   └── strings/
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── package.json
├── README.md
└── PLUGIN_GUIDE.md
```

---

## 🔷 TypeScript Type System

Define all shared types in `src/types/plugin.ts`. Every plugin and utility must be strictly typed using these contracts:

- `InputType` — union of `"text" | "textarea" | "password" | "select"`
- `UtilityInput` — describes a single input field: `name`, `label`, `type`, `placeholder`, `options` (for select), `required`
- `UtilityResult` — the return shape: `result` (string), `language` (for syntax highlighting hint: `"json" | "yaml" | "xml" | "text" | "jwt"`), and optional `metadata` (key-value pairs like algorithm, length, etc.)
- `UtilityDefinition` — a single runnable utility: `id`, `label`, `description`, `inputs[]`, `pipeAlias` (globally unique, e.g. `"base64:encode"`), and `run(inputs) => Promise<UtilityResult>`
- `PluginManifest` — a category grouping: `id`, `label`, `description`, `version`, `utilities[]`

---

## 🔌 Plugin System Architecture

Every built-in category AND third-party extension must implement the `PluginManifest` contract. The system must:

- Statically import all built-in plugins from `src/plugins/*/index.ts` at startup
- Dynamically scan `~/.devtool/plugins/*/index.js` at runtime using `import()` for user-installed plugins
- Warn and skip on `id` conflicts — built-in plugins always take precedence
- Expose a `PluginRegistry` class with methods to register plugins, retrieve all plugins, look up a utility by `pipeAlias`, and look up a utility by `pluginId + utilityId`

Community plugin authors must ship compiled `.js` files and include a `devtool-plugin` keyword in their `package.json`. Document the full authoring contract in `PLUGIN_GUIDE.md`.

---

## 🖥️ TUI Interaction Flow

The TUI must follow this exact navigation hierarchy:

1. **Main Menu** — lists all registered plugin categories using arrow-key selection
2. **Sub Menu** — lists all utilities within the selected category, plus a Back option
3. **Input Form** — renders one `ink-text-input` per field defined in the utility's `inputs[]` schema. Supports multi-field forms with Tab to advance between fields
4. **Result View** — displays the output with syntax highlighting via `cli-highlight`. Shows keyboard shortcuts: `[C]` Copy to clipboard, `[R]` Retry with new input, `[B]` Back to submenu, `[Q]` Quit
5. **Error View** — consistent error display with the user-friendly message and raw error detail when `--debug` flag is active

State must flow top-down through React props. Use `useState` and `useCallback` inside Ink components. No global mutable state.

---

## 🔧 Pipe / Stdin Mode

When `process.stdin.isTTY` is `false`, the CLI must operate non-interactively:

- Syntax: `devtool <pipeAlias> [--flag value]`
- Read full stdin as a string, pass it as the first input field's value
- Additional inputs can be passed as named flags (e.g. `--key mysecret` for HMAC)
- Output must be **plain text or raw JSON only** — no colors, no borders, no prompts
- Exit code `0` on success, `1` on runtime error, `2` on unknown alias
- All errors must go to `stderr`; results go to `stdout`

Example aliases that must work:

```
echo "hello"          | devtool base64:encode
echo "aGVsbG8="       | devtool base64:decode
cat token.txt         | devtool jwt:decode
echo '{"a":1}'        | devtool json:format
date +%s              | devtool ts:todate
echo "hello_world"    | devtool str:camel
```

---

## ⚙️ Build & Configuration Requirements

**tsconfig.json** must use:

- `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- `"target": "ES2022"` or higher
- `"strict": true`
- `"jsx": "react"` for `.tsx` files

**tsup.config.ts** must:

- Bundle entry points: `bin/devtool.ts` and `src/index.ts`
- Output format: ESM only
- Inject shebang `#!/usr/bin/env node` on the bin output
- Enable `dts: true` to generate type declarations

**package.json** must include:

- `"type": "module"`
- `"bin": { "devtool": "./dist/devtool.js" }`
- `"engines": { "node": ">=20.0.0" }`
- `"keywords"` including `"devtool-plugin"` to make the registry discoverable
- `scripts`: `build`, `dev`, `test`, `lint`, `prepublishOnly`

---

## ✅ V1 Feature Checklist

### Encoding / Decoding

- Base64 encode / decode
- URL encode / decode
- HTML encode / decode
- Hex encode / decode

### Hashing

- MD5
- SHA-1, SHA-256, SHA-512
- HMAC-SHA256 (key + message inputs)

### JWT Tools

- Decode JWT — show header, payload, and signature validity status
- Verify JWT — accept secret or public key as second input

### Generators

- UUID v4
- UUID v7
- Password — configurable length, symbols, numbers, uppercase toggles
- Random alphanumeric string — configurable length and charset

### Format Converters

- JSON format / minify / validate
- YAML ↔ JSON (both directions)
- XML ↔ JSON (both directions)
- CSV → JSON

### Date / Time

- Unix timestamp → human-readable (local + UTC)
- Human-readable → Unix timestamp
- Timezone converter (input datetime + source tz + target tz)
- Date diff calculator (between two ISO dates, output in days/hours/minutes)

### String Utilities

- Case converter: camelCase, snake_case, kebab-case, PascalCase, UPPER_CASE, lowercase
- Regex tester: pattern + test string → match groups highlighted
- Line diff viewer: text A vs text B → unified diff output

---

## 🏗️ Code Quality Requirements

- All utility `run()` functions must be **pure** — no side effects, no I/O, no process access
- Every utility must have at least **3 unit tests** in `tests/<plugin>/<utility>.test.ts` using `vitest`
- Use `chalk` only inside TUI Ink components — never in pipe output or utility functions
- All errors must include a user-friendly message and preserve the original error for `--debug` mode
- `--version` and `--help` flags must be handled before the TUI launches
- No `any` types — use `unknown` with type guards where dynamic data is involved

---

## 🚀 Deliverables

1. Full working project scaffold with all files and folders as described above
2. All V1 utilities implemented and wired into the plugin registry
3. Working TUI navigation using Ink + React components
4. Working pipe mode with all `pipeAlias` routes functional
5. `vitest` unit tests for every utility function (minimum 3 per utility)
6. `README.md` with install instructions, full usage examples for both TUI and pipe mode
7. `PLUGIN_GUIDE.md` explaining the `PluginManifest` contract and how to publish a community plugin
