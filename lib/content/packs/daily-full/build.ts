import type { ExamContentPack, MCQItem, ListeningLine } from "@/lib/types/content";
import { dailySessions } from "@/lib/content/daily/build";
import { scenarios } from "@/lib/content/daily/seeds";

function item(id: string, prompt: string, choices: string[], correct: number, explanation: string, offset: number): MCQItem {
  const rotated = choices.map((_, index) => choices[(index + offset) % 4]) as MCQItem["choices"];
  return { id, prompt, choices: rotated, correctIndex: ((correct - (offset % 4) + 4) % 4) as MCQItem["correctIndex"], explanation };
}

function fromDaily(id: string, source: { prompt: string; choices: [string, string, string, string]; correctIndex: number; explanation: string }): MCQItem {
  return { id, prompt: source.prompt, choices: source.choices, correctIndex: source.correctIndex as MCQItem["correctIndex"], explanation: source.explanation };
}

function spokenDuration(lines: ListeningLine[]): number {
  const words = lines.reduce((count, line) => count + line.text.trim().split(/\s+/).length, 0);
  return Math.ceil(words / 2.85 + lines.length * 0.2);
}

function grammarErrorItems(form: number, title: string): MCQItem[] {
  const cases: Array<[string, string[], number, string]> = [
    [`Neither of the ${title} volunteers have completed the form.`, ["Neither of", `the ${title} volunteers`, "have completed", "the form"], 2, "Neither is singular; use has completed."],
    [`The committee discussed about the ${title} proposal yesterday.`, ["The committee", "discussed about", `the ${title} proposal`, "yesterday"], 1, "Discuss is transitive: say discussed the proposal, without about."],
    [`The results of the ${title} survey was shared with students.`, ["The results", `of the ${title} survey`, "was shared", "with students"], 2, "Results is plural, so the passive verb should be were shared."],
    [`The guide explains how does the ${title} system work in practice.`, ["The guide", "explains", `how does the ${title} system work`, "in practice"], 2, "An embedded question uses statement word order: how the system works."],
    [`The team avoided to repeat the ${title} mistake.`, ["The team", "avoided", "to repeat", `the ${title} mistake`], 2, "Avoid takes a gerund: avoided repeating."],
    [`The coordinator has worked on ${title} since three years.`, ["The coordinator", "has worked", `on ${title}`, "since three years"], 3, "Use for with a duration: for three years."],
    [`Despite of the delay, the ${title} event began on time.`, ["Despite of", "the delay", `the ${title} event`, "began on time"], 0, "Despite is not followed by of: despite the delay."],
    [`Each ${title} participant were given a map on arrival.`, [`Each ${title} participant`, "were given", "a map", "on arrival"], 1, "Each participant is singular; use was given."],
    [`The ${title} building, who opened last year, is near campus.`, [`The ${title} building`, "who opened", "last year", "near campus"], 1, "Use which for a thing and a passive verb: which was opened."],
    [`The new ${title} route is more easier to follow than the old one.`, [`The new ${title} route`, "is", "more easier", "than the old one"], 2, "Do not double-mark a comparative: say easier."],
    [`If the ${title} team had checked the forecast, they will have changed the date.`, [`If the ${title} team`, "had checked", "the forecast", "will have changed"], 3, "An unreal past result requires would have changed."],
    [`By next Friday, the ${title} organizers will completed the report.`, ["By next Friday", `the ${title} organizers`, "will completed", "the report"], 2, "Use will have completed before a future deadline."],
  ];
  return cases.map(([sentence, choices, correct, explanation], index) => item(`new${form}-g2-${index + 1}`, `Identify the part with a grammar error: ${sentence}`, choices, correct, explanation, (form + index) % 4));
}

function buildLecture(day: number): { lines: ListeningLine[]; items: MCQItem[] } {
  const session = dailySessions[day];
  const scenario = scenarios[day];
  const lines: ListeningLine[] = [
    { speaker: "Professor", text: `Today we will examine a small community project called ${scenario.title}. As you listen, notice how the organizers responded to evidence from a trial rather than assuming their first plan was perfect.` },
    ...session.reading.passage.split(/\n\n/).map((text) => ({ speaker: "Professor", text })),
    { speaker: "Professor", text: `To understand why this example matters, think about the difference between an intention and an observation. The organizers intended to ${scenario.goal}, but their original method encountered a practical difficulty: ${scenario.challenge}. Only after people tried the service could the team see that limitation clearly. They then chose to ${scenario.action}. Notice that this response preserved the purpose of the project while changing its operation. In evaluation, that distinction is important because a useful goal does not guarantee that the first method will work for every participant.` },
    { speaker: "Professor", text: `We should also be careful about the evidence. The immediate observation was that ${scenario.result}. That is encouraging, but a short trial cannot show whether the same result will appear in another season or with a larger group. Some participants may have used the service more often than others, and the team may still be missing feedback from people who could not participate at all. For this reason, the organizers decided to ${scenario.next}. Their next observations may confirm the improvement, reveal a new obstacle, or suggest a further adjustment.` },
    { speaker: "Professor", text: `The useful lesson here is not that every pilot succeeds. The lesson is that the team identified a specific obstacle, made a limited change, and then planned to ${scenario.next}. This is why careful evaluation matters even after an encouraging result.` },
  ];
  const facts = [
    ["What is the lecture mainly about?", `How ${scenario.title} was tested and revised`, "A comparison of unrelated university exams", "A historical account of an ancient city", "Why every community trial should be canceled", `The professor follows ${scenario.title} from its goal through a challenge, adjustment, and next step.`],
    ["What did the organizers originally want to do?", scenario.goal.charAt(0).toUpperCase() + scenario.goal.slice(1), "Replace all local services immediately", "Avoid collecting feedback", "Close the program before the trial", `The lecture says the aim was to ${scenario.goal}.`],
    ["What difficulty arose during the trial?", scenario.challenge.charAt(0).toUpperCase() + scenario.challenge.slice(1), "The professor forgot the project name", "The team had no participants", "The organizers rejected all comments", `The professor reports that ${scenario.challenge}.`],
    ["How did the team respond?", scenario.action.charAt(0).toUpperCase() + scenario.action.slice(1), "They ignored the difficulty", "They canceled the program without discussion", "They stopped speaking to participants", `The professor says the team ${scenario.action}.`],
    ["Which outcome is mentioned?", scenario.result.charAt(0).toUpperCase() + scenario.result.slice(1), "Every problem disappeared forever", "The trial produced no observations", "The community refused to use the project", `The lecture states that ${scenario.result}.`],
    ["What is the next step for the organizers?", scenario.next.charAt(0).toUpperCase() + scenario.next.slice(1), "Declare the program perfect immediately", "Discard all trial records", "Repeat the original plan unchanged", `The professor says the organizers plan to ${scenario.next}.`],
  ] as const;
  return {
    lines,
    items: facts.map(([prompt, correct, a, b, c, explanation], index) => item(`new${Math.floor(day / 10) + 1}-l3-${index + 1}`, prompt, [correct, a, b, c], 0, explanation, (day + index) % 4)),
  };
}

function buildPack(index: number): ExamContentPack {
  const start = index * 10;
  const form = index + 1;
  const one = dailySessions[start];
  const twoA = dailySessions[start + 1];
  const twoB = dailySessions[start + 2];
  const scenarioA = scenarios[start + 1];
  const scenarioB = scenarios[start + 2];
  const shortSessions = dailySessions.slice(start + 3, start + 7);
  const conversation = dailySessions[start + 7];
  const conversationScript: ListeningLine[] = [
    ...conversation.listening.lines,
    { speaker: "Student", text: "Could students help the organizers collect feedback during the next stage? I would be interested in taking part." },
    { speaker: "Advisor", text: `Yes. ${scenarios[start + 7].group} would welcome comments from people who have tried the project and from those who found it difficult to use.` },
    { speaker: "Student", text: "Should I send them only positive comments, or would a problem be useful too?" },
    { speaker: "Advisor", text: "Both are useful. A positive first result is encouraging, but specific problems help the team decide what to improve before it expands the program." },
  ];
  const lecture = buildLecture(start + 8);
  const grammarPool = dailySessions.slice(start, start + 10).flatMap((session) => session.grammar.slice(0, 2));
  const readingPart2Text = `Two community initiatives illustrate how small trials can guide practical decisions. The first is ${scenarioA.title}; the second is ${scenarioB.title}. Both groups invited feedback before deciding whether to expand.\n\n${scenarioA.title}\n${twoA.reading.passage}\n\n${scenarioB.title}\n${twoB.reading.passage}`;
  const readingPart2Items: MCQItem[] = [
    fromDaily(`new${form}-r2-1`, twoA.reading.questions[0]),
    fromDaily(`new${form}-r2-2`, twoA.reading.questions[1]),
    fromDaily(`new${form}-r2-3`, twoB.reading.questions[0]),
    fromDaily(`new${form}-r2-4`, twoB.reading.questions[1]),
    item(`new${form}-r2-5`, `Which difficulty belonged specifically to ${scenarioA.title}?`, [scenarioA.challenge.charAt(0).toUpperCase() + scenarioA.challenge.slice(1), scenarioB.challenge.charAt(0).toUpperCase() + scenarioB.challenge.slice(1), "No participants were invited", "The organizers had no stated purpose"], 0, `The ${scenarioA.title} section identifies this difficulty; the other project faced a different problem.`, form),
    item(`new${form}-r2-6`, "What do the two projects have in common?", ["Both changed their methods after observing a problem", "Both abandoned their goals immediately", "Both refused to evaluate their results", "Both were permanently closed after one day"], 0, `The ${scenarioA.title} and ${scenarioB.title} sections each describe a trial, a difficulty, and a targeted adjustment.`, form + 1),
  ];
  const readingPart1Items = [
    ...one.reading.questions.map((question, questionIndex) => fromDaily(`new${form}-r1-${questionIndex + 1}`, question)),
    item(`new${form}-r1-4`, `What difficulty did ${scenarios[start].title} encounter?`, [scenarios[start].challenge.charAt(0).toUpperCase() + scenarios[start].challenge.slice(1), "The project had no goal", "All participants refused to attend", "The organizers could not identify any obstacle"], 0, `The passage explains that ${scenarios[start].challenge}.`, form + 2),
  ];
  const shortSegments = shortSessions.map((session, shortIndex) => ({
    audioScript: session.listening.lines.slice(0, 2),
    audioAssetPath: `/audio/mock-2026-v2/form-${form}-short-${shortIndex + 1}.m4a`,
    durationSeconds: spokenDuration(session.listening.lines.slice(0, 2)),
    items: [fromDaily(`new${form}-l1-${shortIndex + 1}`, session.listening.questions[0])],
  }));
  const conversationItems = [
    ...conversation.listening.questions.map((question, questionIndex) => fromDaily(`new${form}-l2-${questionIndex + 1}`, question)),
    item(`new${form}-l2-4`, "What did the organizers do after identifying the issue?", [scenarios[start + 7].action.charAt(0).toUpperCase() + scenarios[start + 7].action.slice(1), "They refused to adjust the trial", "They removed all participants from the study", "They decided not to collect any results"], 0, `The advisor explains that the organizers ${scenarios[start + 7].action}.`, form + 3),
  ];
  const part1Grammar = grammarPool.slice(0, 13).map((question, questionIndex) => fromDaily(`new${form}-g1-${questionIndex + 1}`, question));
  return {
    manifest: { packId: `itep-academic-plus-new-${form}`, version: "1.0.0", locale: "en", createdAt: "2026-10-09", title: `iTEP Academic-Plus — Simulacro Nuevo #${form}` },
    reading: { totalTimeSeconds: 1200, parts: [
      { partNumber: 1, passageTitle: one.reading.title, passageText: one.reading.passage, items: readingPart1Items },
      { partNumber: 2, passageTitle: `${scenarioA.title} and ${scenarioB.title}`, passageText: readingPart2Text, items: readingPart2Items },
    ] },
    listening: { totalTimeSeconds: 1200, parts: [
      { partNumber: 1, title: "Four Short Dialogues", segments: shortSegments },
      { partNumber: 2, title: `Conversation: ${conversation.theme}`, segments: [{ audioScript: conversationScript, audioAssetPath: `/audio/mock-2026-v2/form-${form}-conversation.m4a`, durationSeconds: spokenDuration(conversationScript), items: conversationItems }] },
      { partNumber: 3, title: `Lecture: ${scenarios[start + 8].title}`, segments: [{ audioScript: lecture.lines, audioAssetPath: `/audio/mock-2026-v2/form-${form}-lecture.m4a`, durationSeconds: spokenDuration(lecture.lines), items: lecture.items }] },
    ] },
    grammar: { totalTimeSeconds: 600, parts: [
      { partNumber: 1, kind: "sentence-completion", items: part1Grammar },
      { partNumber: 2, kind: "error-identification", items: grammarErrorItems(form, one.theme) },
    ] },
    writing: { totalTimeSeconds: 1500, tasks: [
      { taskNumber: 1, title: "Short Message", prompt: one.writing.prompt, minWords: 50, maxWords: 75, timeLimitSeconds: 300 },
      { taskNumber: 2, title: "Opinion Essay", prompt: twoA.writing.prompt, minWords: 175, maxWords: 225, timeLimitSeconds: 1200 },
    ] },
    speaking: { warmupSeconds: 60, tasks: [
      { taskNumber: 1, title: "Personal Experience", prompt: one.speaking.prompt, prepSeconds: 30, responseSeconds: 45 },
      { taskNumber: 2, title: "Opinion", prompt: twoA.speaking.prompt, prepSeconds: 45, responseSeconds: 60 },
    ] },
  };
}

export const newFullPacks = Array.from({ length: 6 }, (_, index) => buildPack(index));
