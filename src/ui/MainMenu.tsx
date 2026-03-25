import React from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import type { PluginManifest } from "../types/plugin.js";

interface Props {
  plugins: PluginManifest[];
  onSelect: (plugin: PluginManifest) => void;
}

export function MainMenu({ plugins, onSelect }: Props) {
  useInput((input) => {
    if (input === "q" || input === "Q") process.exit(0);
  });

  const items = plugins.map((p) => ({
    label: `${p.label.padEnd(22)} ${p.description}`,
    value: p.id,
  }));

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          DevTool CLI
        </Text>
        <Text dimColor>  v1.0.0  —  developer toolkit</Text>
      </Box>
      <Text>Select a category:</Text>
      <Box marginTop={1}>
        <SelectInput
          items={items}
          onSelect={(item: { label: string; value: string }) => {
            const plugin = plugins.find((p) => p.id === item.value);
            if (plugin) onSelect(plugin);
          }}
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[↑↓] Navigate  [Enter] Select  [Q] Quit</Text>
      </Box>
    </Box>
  );
}
