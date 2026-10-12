import { dailySessions } from "@/lib/content/daily/build";
import { grammarC1Topics, sentenceParts } from "@/lib/grammar-c1/bank";
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
  if (section === "Grammar") {
    const topic = grammarC1Topics.find((candidate) => normalized(failedRule).startsWith(normalized(`${candidate.title}:`)));
    if (topic) {
      const remaining = topic.questions.filter((question) => !normalized(failedRule).includes(normalized(question.explanation)));
      const errors = remaining.filter((question) => question.kind === "error-word");
      const completions = remaining.filter((question) => question.kind === "complete-sentence");
      if (errors.length < 2 || completions.length < 1) return null;
      const selected = [errors[0], errors[1], completions[0]];
      return selected.map((question): NotebookQuestion => {
        if (question.kind === "complete-sentence") return {
          context: "", question: question.sentence, options: question.choices,
          correctIndex: "ABCD".indexOf(question.correct), explanation: question.explanation,
        };
        const parts = sentenceParts(question.sentence);
        return {
          context: "", question: `Identify the ONE incorrect word: ${parts.map((part) => part.mark ? `[${part.mark}]${part.text}` : part.text).join("")}`,
          options: parts.filter((part) => part.mark).map((part) => part.text) as NotebookQuestion["options"],
          correctIndex: "ABCD".indexOf(question.wrong), explanation: `${question.explanation} La forma correcta es «${question.correction}».`,
        };
      });
    }
  }
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
