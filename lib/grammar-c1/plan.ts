import { grammarC1Topics } from "./bank";

export interface QuestionRef { topicId: string; index: number }
export interface GrammarDay {
  day: number;
  title: string;
  focus: string;
  refs: QuestionRef[];
  kind: "lesson" | "review" | "final";
}

function block(topicId: string, start = 0, count = 5): QuestionRef[] {
  return Array.from({ length: count }, (_, offset) => ({ topicId, index: start + offset }));
}

function mix(...items: Array<[string, number]>): QuestionRef[] {
  return items.map(([topicId, index]) => ({ topicId, index }));
}

function lesson(topicId: string, errorStart: number, completionStart: number, saveCompletionForFinal = false): QuestionRef[] {
  const error = block(topicId, errorStart);
  return [
    error[0], error[1], { topicId, index: completionStart },
    error[2], error[3], { topicId, index: saveCompletionForFinal ? errorStart + 5 : completionStart + 1 },
    error[4],
  ];
}

export const grammarC1Days: GrammarDay[] = [
  { day: 1, title: "Encuentra el verdadero sujeto", focus: "Núcleo del sujeto y sustantivos que distraen.", refs: lesson("subject-verb-agreement", 0, 21), kind: "lesson" },
  { day: 2, title: "Concordancia con trampas", focus: "Together with, there is/are, one of y every.", refs: lesson("subject-verb-agreement", 5, 23), kind: "lesson" },
  { day: 3, title: "Concordancia avanzada", focus: "Collective nouns, what-clauses, more than one y either/or.", refs: lesson("subject-verb-agreement", 10, 25), kind: "lesson" },
  { day: 4, title: "Subject–verb agreement: cierre", focus: "Relativas, each, criteria, evidence y as well as.", refs: lesson("subject-verb-agreement", 15, 27, true), kind: "lesson" },
  { day: 5, title: "Tiempos y aspecto verbal", focus: "Past perfect, future perfect y participios.", refs: lesson("tenses-aspect", 0, 6, true), kind: "lesson" },
  { day: 6, title: "Condicionales e hipótesis", focus: "Unreal present/past, unless e inversión condicional.", refs: lesson("conditionals", 0, 6), kind: "lesson" },
  { day: 7, title: "Inversión y énfasis", focus: "Rarely, only after, hardly y no sooner.", refs: lesson("inversion", 0, 6, true), kind: "lesson" },
  { day: 8, title: "Subjuntivo formal", focus: "Recommend, insist y be + participio.", refs: lesson("subjunctive", 0, 6), kind: "lesson" },
  { day: 9, title: "Relativos y pronombres", focus: "Who, whom, whose, which y where.", refs: lesson("relatives-pronouns", 0, 6, true), kind: "lesson" },
  { day: 10, title: "Artículos y determinantes", focus: "A/an, contables e incontables, every.", refs: lesson("articles-determiners", 0, 6), kind: "lesson" },
  { day: 11, title: "Modificadores y paralelismo", focus: "Adjetivos, adverbios y listas paralelas.", refs: lesson("modifiers-parallelism", 0, 6, true), kind: "lesson" },
  { day: 12, title: "Comparaciones y cantidades", focus: "Fewer/less, as...as, than y comparativos.", refs: lesson("comparison-quantifiers", 0, 6), kind: "lesson" },
  { day: 13, title: "Voz pasiva y participios", focus: "Be + participio y adjetivos -ed/-ing.", refs: lesson("passive-participles", 0, 6, true), kind: "lesson" },
  { day: 14, title: "Patrones verbales", focus: "Gerundios, infinitivos y verbo base.", refs: lesson("verb-patterns", 0, 6), kind: "lesson" },
  { day: 15, title: "Preposiciones y conectores", focus: "Although/despite, because of y colocaciones.", refs: lesson("prepositions-connectors", 0, 6, true), kind: "lesson" },
  { day: 16, title: "Estilo indirecto", focus: "Reported questions, say/tell y secuencia temporal.", refs: lesson("reported-speech", 0, 6), kind: "lesson" },
  { day: 17, title: "Repaso: estructuras verbales", focus: "Concordancia, tiempos, condicionales, inversión y subjuntivo.", refs: mix(["subject-verb-agreement", 21], ["tenses-aspect", 1], ["conditionals", 6], ["inversion", 4], ["subjunctive", 6]), kind: "review" },
  { day: 18, title: "Repaso: precisión de la oración", focus: "Relativos, artículos, modificadores, comparación y pasiva.", refs: mix(["relatives-pronouns", 3], ["articles-determiners", 6], ["modifiers-parallelism", 1], ["comparison-quantifiers", 6], ["passive-participles", 4]), kind: "review" },
  { day: 19, title: "Repaso: completa y corrige", focus: "Patrones, conectores, estilo indirecto y concordancia.", refs: mix(["verb-patterns", 6], ["prepositions-connectors", 0], ["reported-speech", 6], ["subject-verb-agreement", 13], ["tenses-aspect", 4]), kind: "review" },
  { day: 20, title: "Reto final mixto", focus: "13 oraciones para completar y 12 errores para detectar, como en Grammar de iTEP.", refs: mix(
    ["subject-verb-agreement", 28], ["tenses-aspect", 7], ["conditionals", 6], ["inversion", 7],
    ["subjunctive", 6], ["relatives-pronouns", 7], ["articles-determiners", 6], ["modifiers-parallelism", 7],
    ["comparison-quantifiers", 6], ["passive-participles", 7], ["verb-patterns", 6], ["prepositions-connectors", 7], ["reported-speech", 6],
    ["tenses-aspect", 5], ["conditionals", 5], ["inversion", 5],
    ["subjunctive", 5], ["relatives-pronouns", 5], ["articles-determiners", 5], ["modifiers-parallelism", 5],
    ["comparison-quantifiers", 5], ["passive-participles", 5], ["verb-patterns", 5], ["prepositions-connectors", 5],
    ["reported-speech", 5],
  ), kind: "final" },
];

export function isValidGrammarPlan(): boolean {
  const topics = new Map(grammarC1Topics.map((topic) => [topic.id, topic]));
  return grammarC1Days.length === 20 && grammarC1Days.every((day, index) =>
    day.day === index + 1 && day.refs.length >= 5 && day.refs.every((ref) =>
      Number.isInteger(ref.index) && ref.index >= 0 && ref.index < (topics.get(ref.topicId)?.questions.length ?? 0)
    )
  );
}
