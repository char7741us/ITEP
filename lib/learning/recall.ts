import { grammarC1Topics, sentenceParts, completedSentence, correctedSentence } from "@/lib/grammar-c1/bank";
import { dateFromKey } from "./model";

export function recallForDay(day: string) {
  const date = dateFromKey(day);
  const ordinal = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const topic = grammarC1Topics[((ordinal % grammarC1Topics.length) + grammarC1Topics.length) % grammarC1Topics.length];
  const index = ((Math.floor(ordinal / grammarC1Topics.length) % topic.questions.length) + topic.questions.length) % topic.questions.length;
  const question = topic.questions[index];
  const parts = sentenceParts(question.sentence);
  const options = question.kind === "complete-sentence" ? question.choices : parts.filter((part) => part.mark).map((part) => part.text);
  const correctIndex = "ABCD".indexOf(question.kind === "error-word" ? question.wrong : question.correct);
  return { id: `recall-v1:${topic.id}:${index}`, topic, question, parts, options, correctIndex, solution: question.kind === "error-word" ? correctedSentence(question) : completedSentence(question) };
}
