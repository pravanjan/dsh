import React, { useState, useCallback } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import type { PluginManifest, UtilityDefinition, UtilityResult } from "./types/plugin.js";
import { MainMenu } from "./ui/MainMenu.js";
import { SubMenu } from "./ui/SubMenu.js";
import { InputForm } from "./ui/InputForm.js";
import { ResultView } from "./ui/ResultView.js";
import { ErrorView } from "./ui/ErrorView.js";

type Screen = "main" | "sub" | "form" | "loading" | "result" | "error";

interface AppProps {
  plugins: PluginManifest[];
  debug?: boolean;
}

export function App({ plugins, debug = false }: AppProps) {
  const [screen, setScreen] = useState<Screen>("main");
  const [selectedPlugin, setSelectedPlugin] = useState<PluginManifest | null>(null);
  const [selectedUtility, setSelectedUtility] = useState<UtilityDefinition | null>(null);
  const [result, setResult] = useState<UtilityResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastInputs, setLastInputs] = useState<Record<string, string>>({});

  const handleSelectPlugin = useCallback((plugin: PluginManifest) => {
    setSelectedPlugin(plugin);
    setScreen("sub");
  }, []);

  const handleSelectUtility = useCallback((utility: UtilityDefinition) => {
    setSelectedUtility(utility);
    setLastInputs({});
    setScreen("form");
  }, []);

  const handleFormSubmit = useCallback(
    (inputs: Record<string, string>) => {
      if (!selectedUtility) return;
      setLastInputs(inputs);
      setScreen("loading");

      selectedUtility
        .run(inputs)
        .then((res) => {
          setResult(res);
          setError(null);
          setScreen("result");
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setResult(null);
          setScreen("error");
        });
    },
    [selectedUtility]
  );

  const handleRetry = useCallback(() => {
    setScreen("form");
  }, []);

  const handleBackToSub = useCallback(() => {
    setResult(null);
    setError(null);
    setScreen("sub");
  }, []);

  const handleBackToMain = useCallback(() => {
    setSelectedPlugin(null);
    setSelectedUtility(null);
    setScreen("main");
  }, []);

  if (screen === "main") {
    return <MainMenu plugins={plugins} onSelect={handleSelectPlugin} />;
  }

  if (screen === "sub" && selectedPlugin) {
    return (
      <SubMenu
        plugin={selectedPlugin}
        onSelect={handleSelectUtility}
        onBack={handleBackToMain}
      />
    );
  }

  if (screen === "form" && selectedUtility) {
    return (
      <InputForm
        utility={selectedUtility}
        initialValues={lastInputs}
        onSubmit={handleFormSubmit}
        onBack={handleBackToSub}
      />
    );
  }

  if (screen === "loading") {
    return (
      <Box paddingX={1} paddingY={1}>
        <Spinner type="dots" />
        <Text>  Running…</Text>
      </Box>
    );
  }

  if (screen === "result" && result && selectedUtility) {
    return (
      <ResultView
        result={result}
        utility={selectedUtility}
        onRetry={handleRetry}
        onBack={handleBackToSub}
      />
    );
  }

  if (screen === "error" && error) {
    return (
      <ErrorView
        error={error}
        debug={debug}
        onRetry={handleRetry}
        onBack={handleBackToSub}
      />
    );
  }

  return (
    <Box padding={1}>
      <Text dimColor>Loading…</Text>
    </Box>
  );
}
