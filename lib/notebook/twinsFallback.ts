import { dailySessions } from "@/lib/content/daily/build";
import { getCoachGuide } from "./coach";
import { comprehensionRule, type NotebookSection } from "./failedRules";

export interface NotebookQuestion {
  context: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function getBankTwins(section: NotebookSection, failedRule: string): NotebookQuestion[] | null {
  const guide = getCoachGuide(section, failedRule);
  const candidates: NotebookQuestion[] = [];

  for (const session of dailySessions) {
    const items = section === "Grammar" ? session.grammar : section === "Reading" ? session.reading.questions : session.listening.questions;
    const context = section === "Reading"
      ? session.reading.passage
      : section === "Listening"
        ? session.listening.lines.map((line) => `${line.speaker}: ${line.text}`).join("\n")
        : "";

    for (const item of items) {
      const rule = section === "Grammar" ? item.explanation : comprehensionRule(section, item.prompt);
      if (normalized(rule) !== normalized(failedRule)) continue;
      candidates.push({
        context,
        question: item.prompt,
        options: item.choices,
        correctIndex: item.correctIndex,
        explanation: `${guide.idea} ${guide.trap} Pista original en inglés: ${item.explanation}`,
      });
    }
  }

  if (candidates.length < 3) return null;
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const unique: NotebookQuestion[] = [];
  const prompts = new Set<string>();
  for (const candidate of shuffled) {
    const prompt = normalized(candidate.question);
    if (prompts.has(prompt)) continue;
    prompts.add(prompt);
    unique.push(candidate);
    if (unique.length === 3) return unique;
  }
  return null;
}
