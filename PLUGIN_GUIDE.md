# dsh Plugin Authoring Guide

Community plugins extend `dsh` with new utility categories. This guide covers everything you need to build and publish a plugin.

---

## How Plugin Discovery Works

On startup, `dsh` loads plugins from two sources:

1. **Built-in plugins** — statically imported at compile time from `src/plugins/*/index.ts`
2. **User plugins** — dynamically loaded at runtime from `~/.devtool/plugins/*/index.js`

Built-in plugins always take precedence. If a community plugin registers a `pipeAlias` that conflicts with a built-in, it is skipped with a warning.

---

## The `PluginManifest` Contract

Every plugin must export a default export (or named `plugin` export) that satisfies this TypeScript interface:

```typescript
export interface PluginManifest {
  id: string;          // Unique plugin identifier, e.g. "my-tools"
  label: string;       // Display name shown in TUI main menu
  description: string; // Short description shown in TUI
  version: string;     // Semver string, e.g. "1.0.0"
  utilities: UtilityDefinition[];
}
```

### `UtilityDefinition`

Each entry in `utilities` must satisfy:

```typescript
export interface UtilityDefinition {
  id: string;          // Unique within the plugin, e.g. "base-convert"
  label: string;       // Display name in TUI sub-menu
  description: string; // One-line description
  inputs: UtilityInput[];
  pipeAlias: string;   // Globally unique pipe alias, e.g. "mytools:convert"
  run(inputs: Record<string, string>): Promise<UtilityResult>;
}
```

### `UtilityInput`

Describes a single form field rendered in the TUI and accepted as a flag in pipe mode:

```typescript
export interface UtilityInput {
  name: string;           // Used as the key in inputs Record and as --flag name
  label: string;          // Displayed in TUI
  type: InputType;        // "text" | "textarea" | "password" | "select"
  placeholder?: string;
  options?: SelectOption[]; // Required when type === "select"
  required?: boolean;     // Defaults to true
  defaultValue?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
```

### `UtilityResult`

The return type of every `run()` function:

```typescript
export interface UtilityResult {
  result: string;                          // The output string
  language: "json" | "yaml" | "xml" | "text" | "jwt"; // For syntax highlighting
  metadata?: Record<string, string>;       // Optional key-value context shown in TUI
}
```

---

## Input Behaviour

- **Pipe mode**: stdin is read, trimmed, and placed in `inputs[utility.inputs[0].name]`. Additional inputs are passed as `--flagName value` CLI flags (values are trimmed).
- **TUI mode**: each `UtilityInput` is rendered as a form field. `password` type masks the value with `*`.
- If `inputs` is empty, the utility is invoked immediately with `{}`.

---

## Writing a Plugin

### 1. Create the project

```
mkdir dsh-plugin-mytools
cd dsh-plugin-mytools
npm init -y
npm install --save-dev typescript
```

### 2. Set `package.json` metadata

```json
{
  "name": "dsh-plugin-mytools",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "keywords": ["devtool-plugin"],
  "scripts": {
    "build": "tsc"
  }
}
```

> The `devtool-plugin` keyword is required for discoverability.

### 3. Write `src/index.ts`

```typescript
import type { PluginManifest, UtilityResult } from "dsh/types"; // or copy the interfaces

const plugin: PluginManifest = {
  id: "mytools",
  label: "My Tools",
  description: "Custom utilities for my workflow",
  version: "1.0.0",
  utilities: [
    {
      id: "reverse",
      label: "Reverse String",
      description: "Reverse the characters of a string",
      pipeAlias: "mytools:reverse",
      inputs: [
        {
          name: "input",
          label: "Text to reverse",
          type: "text",
          placeholder: "Enter any text",
          required: true,
        },
      ],
      async run(inputs: Record<string, string>): Promise<UtilityResult> {
        const text = inputs["input"];
        if (!text) throw new Error("Input is required");
        return {
          result: text.split("").reverse().join(""),
          language: "text",
          metadata: { length: String(text.length) },
        };
      },
    },
  ],
};

export default plugin;
```

### 4. Build

```
npx tsc --module NodeNext --moduleResolution NodeNext --target ES2022 --outDir dist --declaration
```

Or configure `tsconfig.json` accordingly.

### 5. Install locally

```
mkdir -p ~/.devtool/plugins/mytools
cp dist/index.js ~/.devtool/plugins/mytools/index.js
```

`dsh` scans `~/.devtool/plugins/*/index.js` at startup using dynamic `import()`. Your plugin's default export is loaded as the `PluginManifest`.

---

## Pipe Mode Usage

Once installed, your utility is available via pipe alias:

```bash
echo "hello world" | dsh mytools:reverse
# → dlrow olleh
```

---

## Rules and Best Practices

| Rule | Reason |
|---|---|
| `run()` must be a **pure function** — no I/O, no `process` access | Ensures testability and TUI safety |
| Never use `chalk` or ANSI codes inside `run()` | Pipe mode output must be plain text |
| Always throw a user-friendly `Error` for invalid input | Displayed in TUI ErrorView and pipe stderr |
| `pipeAlias` must be globally unique across all plugins | Conflicts cause your plugin to be skipped |
| Ship compiled `.js` files only — no TypeScript source in `~/.devtool/plugins/` | Node loads them with `import()` at runtime |
| Use `unknown` with type guards, never `any` | Required for compatibility with strict mode |

---

## Conflict Handling

If your plugin's `pipeAlias` matches an existing built-in alias, `dsh` will print a warning and skip the conflicting utility:

```
[PluginRegistry] Skipping utility "mytools:reverse" from plugin "mytools" — alias conflicts with built-in
```

Built-in plugin IDs that are reserved: `encoding`, `hashing`, `jwt`, `generators`, `converters`, `datetime`, `strings`.

---

## Publishing to npm

```bash
npm publish --access public
```

Users can then install and activate your plugin:

```bash
npm install -g dsh-plugin-mytools
mkdir -p ~/.devtool/plugins/mytools
cp $(npm root -g)/dsh-plugin-mytools/dist/index.js ~/.devtool/plugins/mytools/index.js
```

---

## Example: Multi-input Utility

Utilities can accept multiple inputs. In TUI mode the user fills them in sequence; in pipe mode additional fields come from `--flag value` arguments.

```typescript
{
  id: "pad",
  label: "Pad String",
  description: "Pad a string to a given length",
  pipeAlias: "mytools:pad",
  inputs: [
    { name: "input",  label: "Text",         type: "text", required: true },
    { name: "length", label: "Total length", type: "text", placeholder: "20", defaultValue: "20" },
    { name: "char",   label: "Pad character",type: "text", placeholder: " ",  defaultValue: " " },
  ],
  async run(inputs) {
    const text   = inputs["input"]  ?? "";
    const length = parseInt(inputs["length"] ?? "20", 10);
    const char   = inputs["char"]   ?? " ";
    return { result: text.padEnd(length, char), language: "text" };
  },
}
```

Pipe usage:

```bash
echo "hello" | dsh mytools:pad --length 10 --char .
# → hello.....
```

---

## Example: Select Input

Use `type: "select"` when the input must be one of a fixed set of values:

```typescript
{
  name: "encoding",
  label: "Encoding",
  type: "select",
  options: [
    { label: "UTF-8",   value: "utf-8"   },
    { label: "Latin-1", value: "latin1"  },
    { label: "ASCII",   value: "ascii"   },
  ],
  required: true,
}
```

In TUI mode this renders as an arrow-key menu. In pipe mode pass the value directly:

```bash
echo "hello" | dsh mytools:convert --encoding latin1
```

---

## Getting Help

- Open an issue: https://github.com/anthropics/claude-code/issues
- Run `dsh --help` to see all built-in pipe aliases
