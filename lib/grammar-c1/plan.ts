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

export const grammarC1Days: GrammarDay[] = [
  { day: 1, title: "Encuentra el verdadero sujeto", focus: "Núcleo del sujeto y sustantivos que distraen.", refs: block("subject-verb-agreement", 0), kind: "lesson" },
  { day: 2, title: "Concordancia con trampas", focus: "Together with, there is/are, one of y every.", refs: block("subject-verb-agreement", 5), kind: "lesson" },
  { day: 3, title: "Concordancia avanzada", focus: "Collective nouns, what-clauses, more than one y either/or.", refs: block("subject-verb-agreement", 10), kind: "lesson" },
  { day: 4, title: "Subject–verb agreement: cierre", focus: "Relativas, each, criteria, evidence y as well as.", refs: block("subject-verb-agreement", 15), kind: "lesson" },
  { day: 5, title: "Tiempos y aspecto verbal", focus: "Past perfect, future perfect y participios.", refs: block("tenses-aspect"), kind: "lesson" },
  { day: 6, title: "Condicionales e hipótesis", focus: "Unreal present/past, unless e inversión condicional.", refs: block("conditionals"), kind: "lesson" },
  { day: 7, title: "Inversión y énfasis", focus: "Rarely, only after, hardly y no sooner.", refs: block("inversion"), kind: "lesson" },
  { day: 8, title: "Subjuntivo formal", focus: "Recommend, insist y be + participio.", refs: block("subjunctive"), kind: "lesson" },
  { day: 9, title: "Relativos y pronombres", focus: "Who, whom, whose, which y where.", refs: block("relatives-pronouns"), kind: "lesson" },
  { day: 10, title: "Artículos y determinantes", focus: "A/an, contables e incontables, every.", refs: block("articles-determiners"), kind: "lesson" },
  { day: 11, title: "Modificadores y paralelismo", focus: "Adjetivos, adverbios y listas paralelas.", refs: block("modifiers-parallelism"), kind: "lesson" },
  { day: 12, title: "Comparaciones y cantidades", focus: "Fewer/less, as...as, than y comparativos.", refs: block("comparison-quantifiers"), kind: "lesson" },
  { day: 13, title: "Voz pasiva y participios", focus: "Be + participio y adjetivos -ed/-ing.", refs: block("passive-participles"), kind: "lesson" },
  { day: 14, title: "Patrones verbales", focus: "Gerundios, infinitivos y verbo base.", refs: block("verb-patterns"), kind: "lesson" },
  { day: 15, title: "Preposiciones y conectores", focus: "Although/despite, because of y colocaciones.", refs: block("prepositions-connectors"), kind: "lesson" },
  { day: 16, title: "Estilo indirecto", focus: "Reported questions, say/tell y secuencia temporal.", refs: block("reported-speech"), kind: "lesson" },
  { day: 17, title: "Repaso: estructuras verbales", focus: "Concordancia, tiempos, condicionales, inversión y subjuntivo.", refs: mix(["subject-verb-agreement", 2], ["tenses-aspect", 1], ["conditionals", 3], ["inversion", 4], ["subjunctive", 2]), kind: "review" },
  { day: 18, title: "Repaso: precisión de la oración", focus: "Relativos, artículos, modificadores, comparación y pasiva.", refs: mix(["relatives-pronouns", 3], ["articles-determiners", 4], ["modifiers-parallelism", 1], ["comparison-quantifiers", 2], ["passive-participles", 4]), kind: "review" },
  { day: 19, title: "Repaso: errores que se esconden", focus: "Patrones, conectores, estilo indirecto y concordancia.", refs: mix(["verb-patterns", 2], ["prepositions-connectors", 0], ["reported-speech", 1], ["subject-verb-agreement", 13], ["tenses-aspect", 4]), kind: "review" },
  { day: 20, title: "Reto final: detecta el error", focus: "Trece oraciones mezcladas, una por cada tema esencial.", refs: mix(
    ["subject-verb-agreement", 20], ["tenses-aspect", 5], ["conditionals", 5], ["inversion", 5],
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
