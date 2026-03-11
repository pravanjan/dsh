export type InputType = "text" | "textarea" | "password" | "select";

export interface SelectOption {
  label: string;
  value: string;
}

export interface UtilityInput {
  name: string;
  label: string;
  type: InputType;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  defaultValue?: string;
}

export interface UtilityResult {
  result: string;
  language: "json" | "yaml" | "xml" | "text" | "jwt";
  metadata?: Record<string, string>;
}

export interface UtilityDefinition {
  id: string;
  label: string;
  description: string;
  inputs: UtilityInput[];
  pipeAlias: string;
  run(inputs: Record<string, string>): Promise<UtilityResult>;
}

export interface PluginManifest {
  id: string;
  label: string;
  description: string;
  version: string;
  utilities: UtilityDefinition[];
}
