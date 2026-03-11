import React from "react";
import { Box, Text, useInput } from "ink";

interface Props {
  error: Error;
  debug: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export function ErrorView({ error, debug, onRetry, onBack }: Props) {
  useInput((input, key) => {
    const lower = input.toLowerCase();
    if (lower === "r") onRetry();
    else if (lower === "b" || key.escape) onBack();
    else if (lower === "q") process.exit(0);
  });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box borderStyle="round" borderColor="red" paddingX={1} marginBottom={1}>
        <Box flexDirection="column">
          <Text bold color="red">
            Error
          </Text>
          <Text>{error.message}</Text>
          {debug && error.stack && (
            <Box marginTop={1}>
              <Text dimColor>{error.stack}</Text>
            </Box>
          )}
        </Box>
      </Box>
      <Text dimColor>[R] Retry  [B] Back  [Q] Quit</Text>
    </Box>
  );
}
