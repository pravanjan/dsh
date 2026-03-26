import type { PluginRegistry } from "./PluginRegistry.js";

export async function handlePipe(registry: PluginRegistry, argv: string[]): Promise<void> {
  const alias = argv[2];

  if (!alias || alias.startsWith("-")) {
    process.stderr.write(
      "Usage: dsh <pipeAlias> [--flag value]\n" +
        "Run `dsh --help` for a full list of pipe aliases.\n"
    );
    process.exit(2);
  }

  const utility = registry.getUtilityByAlias(alias);
  if (!utility) {
    process.stderr.write(
      `Unknown pipe alias: "${alias}"\n` +
        "Run `dsh --help` for a full list of pipe aliases.\n"
    );
    process.exit(2);
  }

  // Read all of stdin
  let stdinData = "";
  for await (const chunk of process.stdin as AsyncIterable<Buffer>) {
    stdinData += chunk.toString("utf-8");
  }
  stdinData = stdinData.trim();

  // Build inputs: first field from stdin, named flags from argv
  const inputs: Record<string, string> = {};

  const firstField = utility.inputs[0];
  if (firstField) {
    inputs[firstField.name] = stdinData;
  }

  // Parse --flag value pairs from remaining argv
  const flags = argv.slice(3);
  for (let i = 0; i < flags.length - 1; i++) {
    const flag = flags[i];
    const value = flags[i + 1];
    if (flag.startsWith("--") && !value.startsWith("--")) {
      inputs[flag.slice(2)] = value.trim();
      i++; // skip the value token
    }
  }

  try {
    const result = await utility.run(inputs);
    process.stdout.write(result.result + "\n");
    process.exit(0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Error: ${msg}\n`);
    if (argv.includes("--debug") && err instanceof Error && err.stack) {
      process.stderr.write(err.stack + "\n");
    }
    process.exit(1);
  }
}
