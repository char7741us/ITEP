import type { ExamContentPack, MCQItem } from "@/lib/types/content";
import { newFullPacks } from "./daily-full/build";
import { dailySessions } from "@/lib/content/daily/build";
import { scenarios } from "@/lib/content/daily/seeds";
import { grammarC1Topics, sentenceParts } from "@/lib/grammar-c1/bank";
import { itepAcademicPlusV1 } from "./itep-academic-plus-v1";
import { itepAcademicPlusV2 } from "./itep-academic-plus-v2";

function mcq(id: string, prompt: string, choices: [string, string, string, string], explanation: string, offset: number): MCQItem {
  const rotated = choices.map((_, index) => choices[(index + offset) % 4]) as MCQItem["choices"];
  return { id, prompt, choices: rotated, correctIndex: ((4 - offset % 4) % 4) as MCQItem["correctIndex"], explanation };
}

const errorQuestions = Array.from({ length: 21 }, (_, row) => grammarC1Topics.flatMap((topic) => {
  const error = topic.questions.filter((question) => question.kind === "error-word");
  return error[row] ? [{ topic: topic.title, question: error[row] }] : [];
})).flat();

const completionQuestions = Array.from({ length: 8 }, (_, row) => grammarC1Topics.flatMap((topic) => {
  const completion = topic.questions.filter((question) => question.kind === "complete-sentence");
  return completion[row] ? [{ topic: topic.title, question: completion[row] }] : [];
})).flat();
const bankCompletions = completionQuestions.map(({ topic, question }) => ({
  prompt: question.sentence, choices: question.choices,
  correctIndex: "ABCD".indexOf(question.correct) as MCQItem["correctIndex"],
  explanation: `${topic}: ${question.explanation}`,
}));
const earlierCompletions = [itepAcademicPlusV1, itepAcademicPlusV2].flatMap((pack) => pack.grammar.parts[0].items);
const advancedCompletions = Array.from({ length: Math.max(bankCompletions.length, earlierCompletions.length) }, (_, row) =>
  [bankCompletions[row], earlierCompletions[row]].filter((question): question is MCQItem | typeof bankCompletions[number] => Boolean(question))
).flat();

function buildStrictPack(base: ExamContentPack, index: number): ExamContentPack {
  const form = index + 1;
  const start = index * 10;
  const one = scenarios[start];
  const twoA = scenarios[start + 1];
  const twoB = scenarios[start + 2];
  const conversation = scenarios[start + 7];
  const lecture = scenarios[start + 8];
  const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const id = (section: string, number: number) => `c1-${form}-${section}-${number}`;

  const partOneReading: MCQItem[] = [
    mcq(id("r1", 1), "Which interpretation best captures the author's main point?", [
      `The ${one.title} trial suggests that a useful goal may require a revised method and further testing.`,
      `The early outcome proves that ${one.title} will work equally well for all future users.`,
      `The initial method was abandoned because the organizers rejected the project's goal.`,
      `The author argues that participant feedback should come only after a permanent launch.`,
    ], "The text distinguishes the project's goal, the revision and the limits of a short trial.", form),
    mcq(id("r1", 2), "Why was the initial approach changed?", [
      capitalize(one.challenge),
      capitalize(one.result),
      capitalize(one.next),
      `The organizers no longer wanted to ${one.goal}.`,
    ], `The difficulty was that ${one.challenge}; the outcome and next step occurred later.`, form + 1),
    mcq(id("r1", 3), "What does the writer imply about the encouraging first result?", [
      "It supports the adjustment but does not establish that the improvement will last or help everyone.",
      "It makes additional observations unnecessary because the sample was already representative.",
      "It shows the original problem was imaginary rather than a genuine barrier.",
      "It is irrelevant because the project did not achieve any of its stated aims.",
    ], "An encouraging short-term observation is not equivalent to a final evaluation.", form + 2),
    mcq(id("r1", 4), "Which follow-up would best address the limitation noted by the author?", [
      capitalize(one.next),
      `Return to the original method without checking whether ${one.challenge}.`,
      `Expand immediately and assume ${one.result} will hold for every participant.`,
      "Report only comments from people who found the trial convenient.",
    ], `The proposed next step is to ${one.next}, which adds evidence beyond the first result.`, form + 3),
  ];

  const partTwoReading: MCQItem[] = [
    mcq(id("r2", 1), `Which obstacle belongs to ${twoA.title}, rather than ${twoB.title}?`, [capitalize(twoA.challenge), capitalize(twoB.challenge), capitalize(twoA.result), capitalize(twoB.next)], `The ${twoA.title} passage identifies ${twoA.challenge} as its obstacle.`, form),
    mcq(id("r2", 2), `How did the ${twoB.title} team respond to its initial difficulty?`, [capitalize(twoB.action), capitalize(twoA.action), capitalize(twoB.result), capitalize(twoB.next)], `The second passage says the team ${twoB.action}.`, form + 1),
    mcq(id("r2", 3), "Which conclusion is supported by both cases?", [
      "A targeted change can preserve the original aim while improving how a project works.",
      "A positive first observation proves that no later evaluation is needed.",
      "Both teams replaced their aims when users identified a difficulty.",
      "Both trials showed that participant feedback was less reliable than the first plan.",
    ], "In both cases, the groups revised a method in response to observations while retaining their aims.", form + 2),
    mcq(id("r2", 4), "What is a shared limitation of the reported outcomes?", [
      "Neither short trial establishes whether its gains would persist or apply to a wider group.",
      "Neither project recorded any response after its method was changed.",
      "Neither team identified the difficulty that prompted its revision.",
      "Neither passage states what the project was intended to achieve.",
    ], "The texts report immediate observations, not long-term or broadly representative evidence.", form + 3),
    mcq(id("r2", 5), `Why does the writer place ${twoA.title} beside ${twoB.title}?`, [
      "To show the same evaluate–revise pattern in two different practical settings.",
      "To demonstrate that the second project copied the first project's exact solution.",
      "To establish which group obtained a statistically significant result.",
      "To argue that the two groups faced identical initial obstacles.",
    ], "The comparison highlights a shared reasoning process, not identical projects or statistical proof.", form),
    mcq(id("r2", 6), "Which recommendation follows most closely from the two passages?", [
      "Gather further feedback before deciding whether a promising adjustment merits wider use.",
      "Scale both projects immediately because each early result was positive.",
      "Ignore participants who could not use the first version of either project.",
      "Restore both original methods so the trials can be compared directly.",
    ], "Both accounts treat early results as a reason to keep evaluating before expansion.", form + 1),
  ];

  const short = base.listening.parts[0].segments.map((segment, position) => {
    const scenario = scenarios[start + 3 + position];
    return { ...segment, items: [mcq(id("l1", position + 1), "What is the advisor's main point?", [
      `The organizers aim to ${scenario.goal} through a limited trial.`,
      `The organizers discovered that ${scenario.challenge} and ended the project.`,
      `The organizers have already ${scenario.action} after reviewing the trial.`,
      `The organizers will ${scenario.next} before inviting anyone to participate.`,
    ], "Only the project's aim and limited-trial status are established in this short exchange.", form + position)] };
  });
  const conversationItems: MCQItem[] = [
    mcq(id("l2", 1), "Which problem prompted the change described by the advisor?", [capitalize(conversation.challenge), capitalize(conversation.result), capitalize(conversation.next), capitalize(conversation.goal)], `The advisor identifies ${conversation.challenge} as the initial problem.`, form),
    mcq(id("l2", 2), "How does the advisor regard the positive initial outcome?", ["Encouraging, but insufficient to justify expansion without more feedback.", "Conclusive evidence that the program works for every potential user.", "A reason to stop collecting information from people who encountered barriers.", "Proof that the original method was preferable to the revised one."], "The advisor explicitly distinguishes an encouraging first result from a final decision.", form + 1),
    mcq(id("l2", 3), "Whose feedback would be useful in the next stage?", ["People who tried the project and people who found it difficult to use.", "Only participants who were satisfied with the project.", "Only the student who asked about joining the team.", "Only organizers who designed the original plan."], "The advisor welcomes comments from users and those who faced access difficulties.", form + 2),
    mcq(id("l2", 4), "Why does the student ask about helping the organizers?", ["The student wants to take part in gathering feedback for the next stage.", "The student wants the trial canceled before further data are collected.", "The student wants to submit only favorable comments about the trial.", "The student is asking to replace the project's stated aim."], "The student explicitly offers to help collect feedback and says they are interested in taking part.", form + 3),
  ];
  const lectureItems: MCQItem[] = [
    mcq(id("l3", 1), "What distinction does the professor emphasize?", ["The difference between a project's intended benefit and what a trial actually shows.", "The difference between spoken and written reports on the same topic.", "The difference between a permanent policy and an unrelated historical example.", "The difference between a project's budget and the professor's personal preference."], "The lecture repeatedly contrasts intention, observation and cautious interpretation.", form),
    mcq(id("l3", 2), "Why did the team alter its procedure?", [capitalize(lecture.challenge), capitalize(lecture.result), capitalize(lecture.next), capitalize(lecture.goal)], `The trial exposed this practical limitation: ${lecture.challenge}.`, form + 1),
    mcq(id("l3", 3), "Which claim would the professor regard as premature?", ["The same improvement will occur in every season and in a much larger group.", "The organizers made an adjustment after identifying an obstacle.", "Some participants used the service more often than others.", "The team planned to collect further observations."], "The professor says a short trial cannot establish general or long-term effects.", form + 2),
    mcq(id("l3", 4), "Why does the professor mention people who could not participate?", ["Their absence may hide barriers that the current feedback does not reveal.", "Their views have already proved the improvement ineffective.", "They were the only participants included in the immediate result.", "They designed the original procedure and therefore cannot be interviewed."], "Feedback from nonparticipants can expose access problems missed by current users.", form + 3),
    mcq(id("l3", 5), "What does the immediate result most reasonably support?", ["The adjustment appeared helpful in the observed short trial, but needs verification.", "The original method worked equally well before the difficulty was noticed.", "The change resolved all possible obstacles for every future user.", "The project's goal was unrelated to the observed outcome."], "The professor calls the result encouraging while stressing its evidential limits.", form),
    mcq(id("l3", 6), "Which additional evidence would most strengthen the team's conclusion?", ["Similar observations from a longer trial with a broader range of participants.", "A more enthusiastic description of the same small sample.", "Fewer comments from participants who reported practical difficulties.", "A decision to expand before observing the project's next stage."], "More time and a broader sample address the limitations the professor identifies.", form + 1),
  ];

  const grammarCompletion: MCQItem[] = [
    ...advancedCompletions.slice(index * 9, index * 9 + 9).map((question, position) => ({
      ...question, id: id("g1", position + 1),
    })),
    ...dailySessions.slice(start, start + 10).flatMap((session) => session.grammar).slice(0, 4).map((question, position) => ({
      ...question, id: id("g1", position + 10), correctIndex: question.correctIndex as MCQItem["correctIndex"],
    })),
  ];
  const grammarErrors: MCQItem[] = errorQuestions.slice(index * 12, index * 12 + 12).map(({ topic, question }, position) => {
    const parts = sentenceParts(question.sentence);
    const choices = parts.filter((part) => part.mark).map((part) => part.text) as MCQItem["choices"];
    return {
      id: id("g2", position + 1),
      prompt: `Identify the ONE incorrect word: ${parts.map((part) => part.mark ? `[${part.mark}]${part.text}` : part.text).join("")}`,
      choices,
      correctIndex: "ABCD".indexOf(question.wrong) as MCQItem["correctIndex"],
      explanation: `${topic}: ${question.explanation} Correct form: ${question.correction}.`,
    };
  });

  return {
    ...base,
    manifest: { ...base.manifest, version: "2.0.0", createdAt: "2026-10-11", title: `iTEP Academic-Plus — Reto C1 #${form}` },
    reading: { ...base.reading, parts: [
      { ...base.reading.parts[0], items: partOneReading },
      { ...base.reading.parts[1], items: partTwoReading },
    ] },
    listening: { ...base.listening, parts: [
      { ...base.listening.parts[0], segments: short },
      { ...base.listening.parts[1], segments: [{ ...base.listening.parts[1].segments[0], items: conversationItems }] },
      { ...base.listening.parts[2], segments: [{ ...base.listening.parts[2].segments[0], items: lectureItems }] },
    ] },
    grammar: { ...base.grammar, parts: [
      { ...base.grammar.parts[0], items: grammarCompletion },
      { ...base.grammar.parts[1], items: grammarErrors },
    ] },
    writing: { ...base.writing, tasks: [
      { ...base.writing.tasks[0], prompt: `Write a 50–75 word email to a classmate about ${one.title}. Explain its aim, identify one limitation of the trial, and ask one specific question that would help decide whether to join. Use a clear, appropriate tone.` },
      { ...base.writing.tasks[1], prompt: `Write a 175–225 word academic opinion essay. Should the organizers of ${twoA.title} expand after a promising short trial? Take a position, support it with two distinct reasons, address one plausible counterargument, and explain what further evidence would change your judgment.` },
    ] },
    speaking: { ...base.speaking, tasks: [
      { ...base.speaking.tasks[0], prompt: `Describe a time when you revised a plan after receiving feedback. Explain the original aim, the specific difficulty, the change you made, and what the outcome did—and did not—show.` },
      { ...base.speaking.tasks[1], prompt: `Should ${twoA.title} expand now or collect more evidence first? State your position, compare the main benefit with one limitation, respond to a possible objection, and conclude with a practical recommendation.` },
    ] },
  };
}

export const strictC1Packs = newFullPacks.map(buildStrictPack);
