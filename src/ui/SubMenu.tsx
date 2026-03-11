import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import type { PluginManifest, UtilityDefinition } from "../types/plugin.js";

interface BackSentinel {
  _back: true;
}
type ItemValue = UtilityDefinition | BackSentinel;

interface Props {
  plugin: PluginManifest;
  onSelect: (utility: UtilityDefinition) => void;
  onBack: () => void;
}

export function SubMenu({ plugin, onSelect, onBack }: Props) {
  const items: Array<{ label: string; value: ItemValue }> = [
    ...plugin.utilities.map((u) => ({
      label: `${u.label.padEnd(26)} ${u.description}`,
      value: u as ItemValue,
    })),
    { label: "<- Back", value: { _back: true } as BackSentinel },
  ];

  const handleSelect = (item: { label: string; value: ItemValue }) => {
    if ("_back" in item.value) {
      onBack();
    } else {
      onSelect(item.value as UtilityDefinition);
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
