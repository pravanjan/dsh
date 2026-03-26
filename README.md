# dsh — Developer Shell Toolkit

> A fast, simple CLI tool for everyday developer tasks. Runs fully on your own computer — no internet needed, no accounts, no tracking.

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-285%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

---

## What is dsh?

`dsh` is a tool that puts common developer tasks in one place. Things like encoding text, checking JWT tokens, formatting JSON, generating passwords, and more — all available from your terminal.

You do not need to open a browser or install many separate tools. Just install `dsh` once and use it anywhere.

It works in two ways:

- **Menu mode** — open a menu with arrow keys, pick what you want, type your input, see the result
- **Script mode** — pass text through a pipe in your terminal commands

---

## Table of Contents

- [What you need first](#what-you-need-first)
- [Install](#install)
- [Try it now](#try-it-now)
- [Menu mode (TUI)](#menu-mode-tui)
- [Script mode (Pipe)](#script-mode-pipe)
  - [Encoding and Decoding](#1-encoding-and-decoding)
  - [Hashing](#2-hashing)
  - [JWT Tokens](#3-jwt-tokens)
  - [Generators](#4-generators)
  - [Format Converters](#5-format-converters)
  - [Date and Time](#6-date-and-time)
  - [String Utilities](#7-string-utilities)
- [All commands list](#all-commands-list)
- [Plugins](#plugins)
- [Development setup](#development-setup)
- [Contributing](#contributing)
- [License](#license)

---

## What you need first

| Requirement | Version |
|---|---|
| Node.js | `>= 20.0.0` |
| npm | `>= 9.0.0` |
| OS | macOS, Linux, Windows (WSL recommended) |

---

## Install

**Step 1 — Install the package:**

```bash
npm install -g @pravanjandev/dsh
```

**Step 2 — Check it works:**

```bash
dsh --version
```

You should see a version number printed. That means it is ready to use.

---

## Try it now

Here are three simple commands to try right away. Each one shows what goes in and what comes out.

**Encode some text to Base64:**

```bash
echo "hello world" | dsh base64:encode
```

```
aGVsbG8gd29ybGQ=
```

**Format a JSON string so it is easy to read:**

```bash
echo '{"name":"dsh","version":1}' | dsh json:format
```

```json
{
  "name": "dsh",
  "version": 1
}
```

**Generate a UUID:**

```bash
echo "1" | dsh gen:uuid4
```

```
3f6c1e2a-9b4d-4f8a-a1e2-3c7f9d0b1234
```

---

## Menu mode (TUI)

Run `dsh` with no arguments to open the menu:

```bash
dsh
```

You will see a screen like this:

```
┌─────────────────────────────────────────────────────────────┐
│  dsh — Developer Shell Toolkit                              │
│                                                             │
│  Pick a category:                                           │
│                                                             │
│  ❯ Encoding / Decoding   Encode and decode text            │
│    Hashing               Create hashes from text           │
│    JWT Tools             Read and check JWT tokens         │
│    Generators            Make UUIDs, passwords, and more   │
│    Format Converters     Change between JSON, YAML, XML    │
│    Date / Time           Work with dates and timestamps    │
│    String Utilities      Change how text looks             │
│                                                             │
│  [↑↓] Move up/down   [Enter] Pick   [Q] Quit               │
└─────────────────────────────────────────────────────────────┘
```

**How to navigate:**

1. Use the **up** and **down** arrow keys to move between options
2. Press **Enter** to pick one
3. You will see a list of tools inside that category:

```
┌─────────────────────────────────────────────────────────────┐
│  Encoding / Decoding                                        │
│                                                             │
│  ❯ Base64 Encode    Turn text into Base64                  │
│    Base64 Decode    Turn Base64 back to text               │
│    URL Encode       Make text safe for a web address       │
│    URL Decode       Read URL-encoded text                  │
│    HTML Encode      Make text safe for HTML                │
│    HTML Decode      Read HTML-encoded text                 │
│    Hex Encode       Turn text into hex                     │
│    Hex Decode       Turn hex back to text                  │
│    ← Back                                                   │
│                                                             │
│  [↑↓] Move   [Enter] Pick   [B] Back                       │
└─────────────────────────────────────────────────────────────┘
```

4. Pick a tool and type your input:

```
┌─────────────────────────────────────────────┐
│  Encoding / Decoding › Base64 Encode        │
│                                             │
│  Text to encode:                            │
│  > hello world_                             │
│                                             │
│  [Enter] Run   [Esc] Back                   │
└─────────────────────────────────────────────┘
```

5. Press **Enter** and see your result:

```
┌──────────────────────────────────────────────────────────┐
│  Result                                                  │
│                                                          │
│  aGVsbG8gd29ybGQ=                                       │
│                                                          │
│  [C] Copy to clipboard   [R] Try again                   │
│  [B] Back to menu        [Q] Quit                        │
└──────────────────────────────────────────────────────────┘
```

**Keys you can use on the result screen:**

| Key | What it does |
|-----|--------------|
| `C` | Copy the result to your clipboard |
| `R` | Go back and try with different input |
| `B` | Go back to the tool list |
| `Q` | Close dsh |

---

## Script mode (Pipe)

You can also use `dsh` directly in your terminal without any menus. This is useful in scripts or when you want a quick result.

**How it works:**

```bash
echo "your input" | dsh command:name
```

The text before `|` is your input. The word after `dsh` is the command to run.

**If something goes wrong:**

| Exit code | What it means |
|-----------|---------------|
| `0` | It worked |
| `1` | Something went wrong (bad input, etc.) |
| `2` | Command name not found |

Add `--debug` to see more details when something fails:

```bash
echo "bad input" | dsh json:format --debug
```

---

### 1. Encoding and Decoding

#### Base64

**What it does:** Turns text into Base64 format, or turns Base64 back into normal text. Base64 is used in many web services and APIs.

**Encode text:**

```bash
echo "hello world" | dsh base64:encode
```

```
aGVsbG8gd29ybGQ=
```

**Decode it back:**

```bash
echo "aGVsbG8gd29ybGQ=" | dsh base64:decode
```

```
hello world
```

---

#### URL Encoding

**What it does:** Makes text safe to put in a web address. Spaces and special characters become `%20`, `%26`, etc.

**Encode:**

```bash
echo "hello world & co" | dsh url:encode
```

```
hello%20world%20%26%20co
```

**Decode:**

```bash
echo "hello%20world%20%26%20co" | dsh url:decode
```

```
hello world & co
```

---

#### HTML Encoding

**What it does:** Makes text safe to put inside HTML. Characters like `<`, `>`, and `"` become `&lt;`, `&gt;`, and `&quot;`.

**Encode:**

```bash
echo '<script>alert("xss")</script>' | dsh html:encode
```

```
&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
```

**Decode:**

```bash
echo '&lt;b&gt;hello&lt;/b&gt;' | dsh html:decode
```

```
<b>hello</b>
```

---

#### Hex Encoding

**What it does:** Turns text into hex (base 16) numbers, or turns hex back into text.

**Encode:**

```bash
echo "hello" | dsh hex:encode
```

```
68656c6c6f
```

**Decode:**

```bash
echo "68656c6c6f" | dsh hex:decode
```

```
hello
```

---

### 2. Hashing

**What it does:** Takes any text and creates a short fixed-length "fingerprint" of it. You cannot turn the hash back into the original text. This is used to check if files or passwords match.

#### MD5

```bash
echo "hello" | dsh hash:md5
```

```
5d41402abc4b2a76b9719d911017c592
```

#### SHA-1

```bash
echo "hello" | dsh hash:sha1
```

```
aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
```

#### SHA-256

```bash
echo "hello" | dsh hash:sha256
```

```
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
```

#### SHA-512

```bash
echo "hello" | dsh hash:sha512
```

```
9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043
```

#### HMAC-SHA256

**What it does:** Like SHA-256 but also uses a secret key. Two people who know the same key can verify the message has not changed.

```bash
echo "my message" | dsh hash:hmac --key "my-secret-key"
```

```
b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad
```

---

### 3. JWT Tokens

**What it does:** JWT (JSON Web Token) is a common format used to pass user info between systems. You can use dsh to read what is inside a token, or to check if it is valid.

#### Decode a JWT

**What it does:** Shows what is inside a JWT token. You do not need a secret key for this.

```bash
cat token.txt | dsh jwt:decode
```

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "1234567890",
    "name": "John Doe",
    "iat": 1516239022,
    "iat_human": "2018-01-18 01:30:22",
    "exp": 1716239022,
    "exp_human": "2024-05-20 21:43:42"
  },
  "valid": true
}
```

If the token has expired, you will see `"(EXPIRED)"` next to the expiry date.

#### Verify a JWT

**What it does:** Checks that the token was signed with the right secret key. Tells you if it is real or has been changed.

```bash
cat token.txt | dsh jwt:verify --secret "your-secret"
```

```
✓ Signature is valid
```

**Verify with an RSA key file:**

```bash
cat token.txt | dsh jwt:verify --secret "$(cat public.pem)"
```

---

### 4. Generators

**What it does:** Creates new random values — UUIDs, passwords, and random strings.

#### UUID v4

**What it does:** Generates a random unique ID. Used to identify things in databases and APIs.

```bash
echo "1" | dsh gen:uuid4
```

```
3f6c1e2a-9b4d-4f8a-a1e2-3c7f9d0b1234
```

**Generate 5 at once:**

```bash
echo "5" | dsh gen:uuid4
```

```
3f6c1e2a-9b4d-4f8a-a1e2-3c7f9d0b1234
a1b2c3d4-e5f6-7890-abcd-ef1234567890
7d3f9a12-4b6c-8e10-d2f4-a8b0c6d2e4f6
c9e1a3b5-d7f9-1234-5678-90abcdef1234
e2f4a6b8-c0d2-e4f6-1234-567890abcdef
```

#### UUID v7

**What it does:** Like UUID v4, but the ID also includes a timestamp. This makes them sort in time order.

```bash
echo "1" | dsh gen:uuid7
```

```
018f4e5a-1234-7abc-8def-9abcdef01234
```

#### Password

**What it does:** Makes a random password. You can choose how long it should be and what characters to include.

```bash
echo "" | dsh gen:password --length 24 --symbols yes --numbers yes --uppercase yes
```

```
X#9mK@2pL!vQ8nR$4wZ&6yT*
```

Options you can use:

| Option | What it does | Example |
|--------|--------------|---------|
| `--length` | How many characters | `--length 20` |
| `--symbols` | Include `!@#$%` etc. | `--symbols yes` |
| `--numbers` | Include `0-9` | `--numbers yes` |
| `--uppercase` | Include `A-Z` | `--uppercase yes` |

#### Random String

**What it does:** Makes a random string using a character set you choose.

```bash
echo "" | dsh gen:random --length 16 --charset hex
```

```
3a7f2b9c0d1e4f5a
```

**Use only your own characters:**

```bash
echo "" | dsh gen:random --length 12 --custom "ABCDEF0123456789"
```

```
A3F1B9C2D4E0
```

Available charsets: `hex`, `alpha`, `alphanumeric`, `numeric`

---

### 5. Format Converters

**What it does:** Changes data from one format to another. For example, from JSON to YAML, or from CSV to JSON.

#### JSON — Pretty print

**What it does:** Takes messy JSON and adds spaces and line breaks to make it easy to read.

```bash
echo '{"name":"dsh","version":1,"active":true}' | dsh json:format
```

```json
{
  "name": "dsh",
  "version": 1,
  "active": true
}
```

**Change the indent size:**

```bash
echo '{"a":1}' | dsh json:format --indent 4
```

```json
{
    "a": 1
}
```

#### JSON — Minify

**What it does:** Removes all spaces from JSON to make it as small as possible. Good for sending data over the internet.

```bash
echo '{ "name": "dsh", "version": 1 }' | dsh json:minify
```

```
{"name":"dsh","version":1}
```

#### JSON — Validate

**What it does:** Checks if your JSON text is written correctly.

```bash
echo '{"valid": true}' | dsh json:validate
```

```
Valid JSON ✓
```

```bash
echo '{bad json}' | dsh json:validate
```

```
Invalid JSON: Unexpected token b in JSON at position 1
```

#### YAML to JSON

**What it does:** Turns a YAML file into JSON format.

```bash
cat config.yaml | dsh yaml:tojson
```

For a file like:
```yaml
name: dsh
version: 1
active: true
```

You get:
```json
{
  "name": "dsh",
  "version": 1,
  "active": true
}
```

#### JSON to YAML

**What it does:** Turns JSON into YAML format.

```bash
echo '{"name":"dsh","version":1}' | dsh json:toyaml
```

```yaml
name: dsh
version: 1
```

#### XML to JSON

**What it does:** Turns an XML file into JSON format.

```bash
cat data.xml | dsh xml:tojson
```

For a file like:
```xml
<person><name>Alice</name><age>30</age></person>
```

You get:
```json
{
  "person": {
    "name": "Alice",
    "age": "30"
  }
}
```

#### JSON to XML

**What it does:** Turns JSON into XML format.

```bash
echo '{"person":{"name":"Alice","age":30}}' | dsh json:toxml
```

```xml
<person>
  <name>Alice</name>
  <age>30</age>
</person>
```

#### CSV to JSON

**What it does:** Turns a CSV file (spreadsheet data) into JSON format. The first row is used as the field names.

```bash
cat users.csv | dsh csv:tojson
```

For a file like:
```
name,age,city
Alice,30,London
Bob,25,Paris
```

You get:
```json
[
  { "name": "Alice", "age": "30", "city": "London" },
  { "name": "Bob", "age": "25", "city": "Paris" }
]
```

**If the CSV has no header row:**

```bash
cat data.csv | dsh csv:tojson --header no
```

---

### 6. Date and Time

**What it does:** Helps you work with dates and times. Change Unix timestamps to readable dates, convert between time zones, or find the difference between two dates.

#### Unix timestamp to readable date

**What it does:** A Unix timestamp is a number that counts seconds since January 1, 1970. This command turns that number into a date you can read.

```bash
echo "1700000000" | dsh ts:todate
```

```
Local : 2023-11-15 03:43:20
UTC   : 2023-11-14 22:13:20 UTC
ISO   : 2023-11-14T22:13:20.000Z
```

It also works with milliseconds (13-digit timestamps):

```bash
echo "1700000000000" | dsh ts:todate
```

**Get the current time as a readable date:**

```bash
date +%s | dsh ts:todate
```

#### Readable date to Unix timestamp

**What it does:** Turns a date you can read into a Unix timestamp number.

```bash
echo "2024-06-15 12:00:00" | dsh ts:fromdate
```

```
1718445600
```

#### Convert between time zones

**What it does:** Takes a date and time in one time zone and tells you what time it is in another time zone.

```bash
echo "2024-03-15 09:00:00" | dsh dt:tzconvert --from "America/New_York" --to "Asia/Kolkata"
```

```
2024-03-15 09:00:00 America/New_York
  →
2024-03-15 19:30:00 Asia/Kolkata
```

Some common time zone names: `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney`

#### Date difference

**What it does:** Tells you how much time is between two dates.

```bash
echo "2024-01-01" | dsh dt:diff --end "2024-12-31"
```

```
Total  : 365d 0h 0m 0s
Days   : 365
Hours  : 8760
Minutes: 525600
```

---

### 7. String Utilities

**What it does:** Changes how text looks — like switching between camelCase and snake_case — or lets you test a pattern match, or compare two pieces of text.

#### Change text case

**What it does:** Changes a word or phrase from one naming style to another.

**To camelCase:**

```bash
echo "hello_world_foo" | dsh str:camel
```

```
helloWorldFoo
```

**Other styles using `--target`:**

```bash
echo "hello world" | dsh str:camel --target pascal
```

```
HelloWorld
```

```bash
echo "hello world" | dsh str:camel --target snake
```

```
hello_world
```

```bash
echo "hello world" | dsh str:camel --target kebab
```

```
hello-world
```

```bash
echo "hello world" | dsh str:camel --target upper_snake
```

```
HELLO_WORLD
```

```bash
echo "HelloWorld" | dsh str:camel --target lower
```

```
hello world
```

All style options: `camel`, `pascal`, `snake`, `kebab`, `upper_snake`, `lower`

#### Test a pattern (Regex)

**What it does:** Checks if a pattern matches parts of your text. Returns all the matches it finds.

```bash
echo "The quick brown fox" | dsh str:regex --pattern "\b\w{5}\b" --flags gi
```

```json
{
  "totalMatches": 2,
  "matches": [
    { "match": "quick", "index": 4 },
    { "match": "brown", "index": 10 }
  ]
}
```

#### Compare two texts (Diff)

**What it does:** Shows what changed between two pieces of text. Lines added are marked with `+`, lines removed with `-`.

```bash
echo "line1\nline2\nline3" | dsh str:diff --textB "line1\nchanged\nline3"
```

```diff
  line1
- line2
+ changed
  line3
```

---

## All commands list

| Command | What it does |
|---------|-------------|
| `base64:encode` | Encode to Base64 |
| `base64:decode` | Decode from Base64 |
| `url:encode` | Encode for use in a web address |
| `url:decode` | Decode from web address format |
| `html:encode` | Encode for use in HTML |
| `html:decode` | Decode from HTML format |
| `hex:encode` | Encode to hex |
| `hex:decode` | Decode from hex |
| `hash:md5` | MD5 hash |
| `hash:sha1` | SHA-1 hash |
| `hash:sha256` | SHA-256 hash |
| `hash:sha512` | SHA-512 hash |
| `hash:hmac` | HMAC-SHA256 (needs `--key`) |
| `jwt:decode` | Read a JWT token (no secret needed) |
| `jwt:verify` | Check a JWT token (needs `--secret`) |
| `gen:uuid4` | Make a UUID v4 |
| `gen:uuid7` | Make a UUID v7 (includes time) |
| `gen:password` | Make a password (`--length --symbols --numbers --uppercase`) |
| `gen:random` | Make a random string (`--length --charset --custom`) |
| `json:format` | Pretty-print JSON (`--indent 2\|4\|tab`) |
| `json:minify` | Remove spaces from JSON |
| `json:validate` | Check if JSON is correct |
| `yaml:tojson` | Change YAML to JSON |
| `json:toyaml` | Change JSON to YAML |
| `xml:tojson` | Change XML to JSON |
| `json:toxml` | Change JSON to XML |
| `csv:tojson` | Change CSV to JSON (`--header yes\|no`) |
| `ts:todate` | Change Unix timestamp to readable date |
| `ts:fromdate` | Change readable date to Unix timestamp |
| `dt:tzconvert` | Change time zone (`--from --to`) |
| `dt:diff` | Find how many days/hours between two dates (`--end`) |
| `str:camel` | Change text case (`--target camel\|pascal\|snake\|kebab\|upper_snake\|lower`) |
| `str:regex` | Test a pattern against text (`--pattern --flags`) |
| `str:diff` | Compare two pieces of text (`--textB`) |

---

## Plugins

`dsh` lets you add your own tools. Any plugin you put in `~/.devtool/plugins/` is found and loaded when dsh starts.

### Install a plugin

```bash
mkdir -p ~/.devtool/plugins
cd ~/.devtool/plugins
npm install --prefix my-plugin some-devtool-plugin
```

### Write your own plugin

A plugin is a `.js` file with a default export. Here is a simple example:

```typescript
import type { PluginManifest } from 'dsh';

const plugin: PluginManifest = {
  id: "my-plugin",           // must be unique
  label: "My Plugin",
  description: "Does something useful",
  version: "1.0.0",
  utilities: [
    {
      id: "my-utility",
      label: "My Utility",
      description: "Turns input into uppercase",
      pipeAlias: "my:upper",  // must be unique
      inputs: [
        {
          name: "input",
          label: "Text",
          type: "text",
          placeholder: "Type something",
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

Put the built file at `~/.devtool/plugins/my-plugin/index.js` and run `dsh`. Your tool will appear in the menu and work in script mode with `my:upper`.

> See [`PLUGIN_GUIDE.md`](PLUGIN_GUIDE.md) for full details on how to write and publish a plugin.

---

## Development setup

If you want to work on the `dsh` source code:

```bash
# Step 1 — Get the code
git clone https://github.com/your-username/dsh.git
cd dsh

# Step 2 — Install packages
npm install

# Step 3 — Run all tests
npm test

# Step 4 — Build
npm run build

# Step 5 — Link so you can test the `dsh` command
npm link
dsh --version
```

### Available scripts

| Command | What it does |
|---------|-------------|
| `npm run build` | Build the project |
| `npm run dev` | Build and watch for changes |
| `npm test` | Run all 285 tests |
| `npm run test:watch` | Run tests and re-run when files change |
| `npm run lint` | Check TypeScript types |
| `npm run prepublishOnly` | Runs before publishing to npm |

---

## Project structure

```
dsh/
├── bin/
│   └── devtool.ts          # Start here — decides menu or script mode
├── src/
│   ├── app.tsx             # Main menu app (Ink/React)
│   ├── index.ts            # Exports for plugin authors
│   ├── core/
│   │   ├── PluginRegistry.ts   # Loads and stores plugins
│   │   ├── PipeHandler.ts      # Handles script mode
│   │   └── ClipboardHelper.ts  # Copy to clipboard
│   ├── types/
│   │   └── plugin.ts           # TypeScript type definitions
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
│       ├── generators/     # uuid, password, random string
│       ├── converters/     # json, yaml, xml, csv
│       ├── datetime/       # timestamps, time zones, date diff
│       └── strings/        # case, regex, diff
└── tests/                  # One test file per tool
```

---

## Contributing

You are welcome to add new tools or fix bugs.

**Steps to get started:**

1. Fork the project and make a new branch:

```bash
git checkout -b feat/my-new-tool
```

2. Write your code. Each tool must have a `run()` function and at least 3 tests.

3. Run the tests to make sure everything passes:

```bash
npm test
npm run lint
```

4. Open a pull request with a short description of what you added and why.

**Rules to follow:**
- The `run()` function must not call any external service or read/write files
- No `any` types in TypeScript — use `unknown` if the type is not known
- Each tool needs a unique `pipeAlias`
- Tests go in `tests/<plugin>/<tool>.test.ts`

**Found a bug?**

Open a [GitHub Issue](https://github.com/your-username/dsh/issues) and include:
- Your OS and Node.js version (`node --version`)
- The exact command you ran
- What you expected to see vs what you got

---

## License

[ISC](LICENSE) — free for personal and commercial use.

---

<div align="center">
  <sub>Built with Node.js · TypeScript · Ink · Runs 100% on your machine</sub>
</div>
