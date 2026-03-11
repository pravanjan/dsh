import { join } from "path";
import { homedir } from "os";
import type { PluginManifest, UtilityDefinition } from "../types/plugin.js";

export class PluginRegistry {
  private plugins = new Map<string, PluginManifest>();
  private aliasMap = new Map<string, UtilityDefinition>();

  register(plugin: PluginManifest): void {
    if (this.plugins.has(plugin.id)) {
      process.stderr.write(
        `[registry] Plugin "${plugin.id}" already registered — skipping\n`
      );
      return;
    }
    for (const utility of plugin.utilities) {
      if (this.aliasMap.has(utility.pipeAlias)) {
        const existing = this.aliasMap.get(utility.pipeAlias)!;
        process.stderr.write(
          `[registry] Alias "${utility.pipeAlias}" conflicts with "${existing.id}" — skipping\n`
        );
        continue;
      }
      this.aliasMap.set(utility.pipeAlias, utility);
    }
    this.plugins.set(plugin.id, plugin);
  }

  getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getUtilityByAlias(alias: string): UtilityDefinition | undefined {
    return this.aliasMap.get(alias);
  }

  getUtilityById(pluginId: string, utilityId: string): UtilityDefinition | undefined {
    return this.plugins.get(pluginId)?.utilities.find((u) => u.id === utilityId);
  }

  getAllAliases(): string[] {
    return Array.from(this.aliasMap.keys());
  }

  async loadUserPlugins(): Promise<void> {
    const dir = join(homedir(), ".devtool", "plugins");
    try {
      const { readdir } = await import("fs/promises");
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const indexPath = join(dir, entry.name, "index.js");
        try {
          const mod = (await import(indexPath)) as { default?: unknown };
          const plugin = mod.default;
          if (
            !plugin ||
            typeof plugin !== "object" ||
            !("id" in plugin) ||
            !("utilities" in plugin)
          ) {
            process.stderr.write(
              `[registry] User plugin "${entry.name}" has no valid default export — skipping\n`
            );
            continue;
          }
          this.register(plugin as PluginManifest);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          process.stderr.write(
            `[registry] Failed to load user plugin "${entry.name}": ${msg}\n`
          );
        }
      }
    } catch {
      // No ~/.devtool/plugins directory — perfectly normal
    }
  }
}
