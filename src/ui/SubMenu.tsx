import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type { PluginManifest, UtilityDefinition } from "../types/plugin.js";

interface Props {
  plugin: PluginManifest;
  onSelect: (utility: UtilityDefinition) => void;
  onBack: () => void;
}

export function SubMenu({ plugin, onSelect, onBack }: Props) {
  const items = [
    ...plugin.utilities.map((u) => ({
      label: `${u.label.padEnd(26)} ${u.description}`,
      value: u.id,
    })),
    { label: "<- Back", value: "__back__" },
  ];

  const handleSelect = (item: { label: string; value: string }) => {
    if (item.value === "__back__") {
      onBack();
    } else {
      const utility = plugin.utilities.find((u) => u.id === item.value);
      if (utility) onSelect(utility);
    }
  };

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {plugin.label}
        </Text>
        <Text dimColor>  {plugin.description}</Text>
      </Box>
      <Text>Select a utility:</Text>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[↑↓] Navigate  [Enter] Select  [Back] to return</Text>
      </Box>
    </Box>
  );
}
