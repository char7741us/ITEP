import type { AttemptRecord, MCQResponse } from "@/lib/types/attempt";
import type { ExamContentPack, MCQItem } from "@/lib/types/content";
import { getListeningItems } from "@/lib/exam/listening";

export type NotebookSection = "Grammar" | "Reading" | "Listening";

export interface FailedTopic {
  section: NotebookSection;
  failed_rule: string;
}

function comprehensionRule(section: "Reading" | "Listening", question: string): string {
  const text = question.toLowerCase();
  const prefix = section === "Reading" ? "Comprensión lectora" : "Comprensión auditiva";

  if (/closest in meaning|word .+ mean/.test(text)) {
    return `${prefix}: deducir el significado de una palabra por el contexto.`;
  }
  if (/main purpose|mainly|main point|main idea|primarily about/.test(text)) {
    return `${prefix}: identificar la idea principal o el propósito del texto.`;
  }
  if (/differ|difference|distinguish|contrast|comparison/.test(text)) {
    return `${prefix}: comparar ideas y reconocer diferencias entre ellas.`;
  }
  if (/why|reason|because|effect|cause/.test(text)) {
    return `${prefix}: reconocer causas, motivos y consecuencias.`;
  }
  if (/suggest|imply|infer|based on|criticism|concern|react|at the end/.test(text)) {
    return `${prefix}: inferir una conclusión o la postura de quien habla o escribe.`;
  }
  return `${prefix}: localizar e interpretar un detalle explícito.`;
}

function missedItems(
  items: MCQItem[],
  responses: MCQResponse[],
  section: NotebookSection
): FailedTopic[] {
  const answers = new Map(responses.map((response) => [response.itemId, response.selectedIndex]));
  return items
    .filter((item) => answers.get(item.id) !== item.correctIndex)
    .map((item) => ({
      section,
      failed_rule:
        section === "Grammar"
          ? item.explanation.trim()
          : comprehensionRule(section, item.prompt),
    }));
}

export function collectFailedTopics(attempt: AttemptRecord, pack: ExamContentPack): FailedTopic[] {
  const readingItems = pack.reading.parts.flatMap((part) => part.items);
  const grammarItems = pack.grammar.parts.flatMap((part) => part.items);
  return [
    ...missedItems(readingItems, attempt.responses.reading, "Reading"),
    ...missedItems(getListeningItems(pack), attempt.responses.listening, "Listening"),
    ...missedItems(grammarItems, attempt.responses.grammar, "Grammar"),
  ];
}
