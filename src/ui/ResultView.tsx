import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { highlight } from "cli-highlight";
import { copyToClipboard } from "../core/ClipboardHelper.js";
import type { UtilityDefinition, UtilityResult } from "../types/plugin.js";

interface Props {
  result: UtilityResult;
  utility: UtilityDefinition;
  onRetry: () => void;
  onBack: () => void;
}

export function ResultView({ result, utility, onRetry, onBack }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useInput((input, key) => {
    const lower = input.toLowerCase();
    if (lower === "c") {
      copyToClipboard(result.result)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          setCopyError(msg);
          setTimeout(() => setCopyError(""), 3000);
        });
    } else if (lower === "r") {
      onRetry();
    } else if (lower === "b" || key.escape) {
      onBack();
    } else if (lower === "q") {
      process.exit(0);
    }
  });

  let displayResult = result.result;
  if (result.language !== "text") {
    try {
      displayResult = highlight(result.result, {
        language: result.language,
        ignoreIllegals: true,
      });
    } catch {
      // fallback to plain text
    }
  }

  const metadata = result.metadata
    ? Object.entries(result.metadata).filter(([, v]) => v !== undefined)
    : [];

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="green">
          {utility.label}
        </Text>
        <Text dimColor>  — result</Text>
      </Box>

      <Box
        borderStyle="round"
        borderColor="green"
        paddingX={1}
        marginBottom={1}
      >
        <Text>{displayResult}</Text>
      </Box>

      {metadata.length > 0 && (
        <Box flexWrap="wrap" marginBottom={1}>
          {metadata.map(([k, v]) => (
            <Box key={k} marginRight={3}>
              <Text dimColor>{k}: </Text>
              <Text color="cyan">{v}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box>
        <Text dimColor>[C] Copy  [R] Retry  [B] Back  [Q] Quit</Text>
        {copied && <Text color="green">  Copied to clipboard!</Text>}
        {copyError && <Text color="red">  Copy failed: {copyError}</Text>}
      </Box>
    </Box>
  );
}
