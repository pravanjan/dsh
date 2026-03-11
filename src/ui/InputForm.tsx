import React, { useState, useCallback, useRef } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import type { UtilityDefinition } from "../types/plugin.js";

interface Props {
  utility: UtilityDefinition;
  initialValues: Record<string, string>;
  onSubmit: (inputs: Record<string, string>) => void;
  onBack: () => void;
}

export function InputForm({ utility, initialValues, onSubmit, onBack }: Props) {
  const fields = utility.inputs;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      init[f.name] = initialValues[f.name] ?? f.defaultValue ?? "";
    }
    return init;
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Keep a ref so advance() always reads the freshest values
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useInput((_input, key) => {
    if (key.escape) onBack();
  });

  const advance = useCallback(
    (fieldName: string, selectedValue?: string) => {
      const latest = valuesRef.current;
      const updated =
        selectedValue !== undefined
          ? { ...latest, [fieldName]: selectedValue }
          : latest;

      setValues(updated);

      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next < fields.length) {
          return next;
        }
        // Last field — submit
        // Use setTimeout to let state settle before calling onSubmit
        setTimeout(() => onSubmit(updated), 0);
        return prev;
      });
    },
    [fields.length, onSubmit]
  );

  // If no fields, submit immediately with defaults
  if (fields.length === 0) {
    onSubmit({});
    return null;
  }

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {utility.label}
        </Text>
      </Box>
      <Text dimColor>{utility.description}</Text>
      <Box marginTop={1} flexDirection="column">
        {fields.map((field, idx) => {
          const isActive = idx === activeIndex;
          const val = values[field.name] ?? "";

          return (
            <Box key={field.name} flexDirection="column" marginBottom={1}>
              <Text color={isActive ? "yellow" : "white"}>
                {isActive ? "> " : "  "}
                {field.label}
                {field.required !== false ? " *" : ""}
              </Text>

              {isActive && field.type === "select" && field.options ? (
                <Box marginLeft={4}>
                  <SelectInput
                    items={field.options.map((o) => ({
                      label: o.label,
                      value: o.value,
                    }))}
                    onSelect={(item: { key?: string; label: string; value: string }) =>
                      advance(field.name, item.value)
                    }
                  />
                </Box>
              ) : isActive ? (
                <Box marginLeft={4}>
                  <TextInput
                    value={val}
                    placeholder={field.placeholder}
                    mask={field.type === "password" ? "*" : undefined}
                    onChange={(v) =>
                      setValues((prev) => ({ ...prev, [field.name]: v }))
                    }
                    onSubmit={() => advance(field.name)}
                  />
                </Box>
              ) : (
                <Box marginLeft={4}>
                  <Text dimColor>
                    {field.type === "password" && val
                      ? "*".repeat(val.length)
                      : val || field.placeholder || "(empty)"}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <Text dimColor>[Enter] Next / Submit  [Esc] Back</Text>
    </Box>
  );
}
