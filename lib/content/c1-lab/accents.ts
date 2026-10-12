export const accents = [
  { id: "us", label: "Estados Unidos", locale: "en-US", instruction: "natural General American English" },
  { id: "ca", label: "Canadá", locale: "en-CA", instruction: "natural contemporary Canadian English" },
  { id: "gb", label: "Reino Unido", locale: "en-GB", instruction: "natural contemporary standard British English" },
  { id: "au", label: "Australia", locale: "en-AU", instruction: "natural contemporary Australian English" },
  { id: "in", label: "India", locale: "en-IN", instruction: "natural educated Indian English, clear and fluent, without exaggeration" },
] as const;
export type AccentId = typeof accents[number]["id"];
/** Six of every ten sessions suggest North America; other regions enrich practice, not official test predictions. */
export function suggestedAccent(day: number): AccentId {
  const index = Number.isSafeInteger(day) && day > 0 ? (day - 1) % 10 : 0;
  return (["us", "us", "ca", "us", "ca", "us", "gb", "gb", "au", "in"] as const)[index];
}
