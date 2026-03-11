export async function copyToClipboard(text: string): Promise<void> {
  const clipboardy = await import("clipboardy");
  await clipboardy.default.write(text);
}
