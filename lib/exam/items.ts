import type { MCQItem } from "@/lib/types/content";
import { loadContentPack } from "@/lib/content/loader";

export function getReadingItems(contentPackKey: string): MCQItem[] {
  const pack = loadContentPack(contentPackKey);
  const [p1, p2] = pack.reading.parts;
  return [...p1.items, ...p2.items];
}

export function getGrammarItems(contentPackKey: string): MCQItem[] {
  const pack = loadContentPack(contentPackKey);
  const [p1, p2] = pack.grammar.parts;
  return [...p1.items, ...p2.items];
}
