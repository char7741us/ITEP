import { dailySessionsSchema, type DailySession } from "./schema";
import { scenarios, type DailyScenario } from "./seeds";

type Question = DailySession["grammar"][number];

function question(prompt: string, choices: string[], correctIndex: number, explanation: string, day: number): Question {
  const offset = day % 4;
  const rotated = choices.map((_, i) => choices[(i + offset) % 4]) as Question["choices"];
  return { prompt, choices: rotated, correctIndex: (correctIndex - offset + 4) % 4, explanation };
}

function grammar(s: DailyScenario, day: number): DailySession["grammar"] {
  const noun = s.title.toLowerCase();
  const sets: Array<Array<[string, string[], number, string]>> = [
    [
      [`The collection of reports about ${noun} ___ on the desk.`, ["is", "are", "were", "have"], 0, "The singular head noun collection takes the singular verb is."],
      [`Neither the director nor the volunteers ___ ready for the ${noun} event.`, ["is", "are", "was", "has"], 1, "With neither...nor, the verb agrees with the nearer plural subject volunteers."],
      [`Which sentence about ${noun} has correct subject–verb agreement?`, ["Each of the plans has a deadline.", "Each of the plans have a deadline.", "Each of the plans were ready.", "Each of the plans are ready."], 0, "Each is singular even when followed by a plural noun phrase."],
    ],
    [
      [`The team developed ___ useful guide for ${noun}.`, ["a", "an", "the", "no article"], 0, "Useful begins with a consonant sound /y/, so the indefinite article is a."],
      [`They held ___ hour-long meeting about ${noun}.`, ["a", "an", "the", "no article"], 1, "Hour begins with a vowel sound because h is silent, so an is required."],
      [`Which sentence uses an article correctly when discussing ${noun}?`, ["The advice was helpful.", "An advice was helpful.", "A advice was helpful.", "Advice were helpful."], 0, "Advice is uncountable and does not take a/an in this use."],
    ],
    [
      [`The volunteers ___ the ${noun} plan last Tuesday.`, ["finished", "have finished", "finish", "had finish"], 0, "The finished time expression last Tuesday requires the past simple."],
      [`Since January, the team ___ several improvements to ${noun}.`, ["has made", "made", "make", "had make"], 0, "Since January links a past starting point to the present, so present perfect is appropriate."],
      [`Which sentence correctly contrasts past simple and present perfect for ${noun}?`, ["We launched it in March, and we have improved it since then.", "We have launched it in March, and we improved it since then.", "We launch it in March, and we have improved it since then.", "We had launch it in March, and we improve it since then."], 0, "A finished date takes past simple; since then takes present perfect."],
    ],
    [
      [`By next Friday, the ${noun} team ___ its final report.`, ["will have completed", "will completing", "has complete", "had completed"], 0, "Future perfect describes an action completed before a future deadline."],
      [`The workshop on ${noun} ___ at 9 a.m. tomorrow.`, ["starts", "starting", "will started", "has start"], 0, "Present simple can describe a fixed future timetable."],
      [`Which sentence correctly expresses a future plan for ${noun}?`, ["We are going to review the results next week.", "We going to review the results next week.", "We were going review the results next week.", "We have going to review the results next week."], 0, "Be going to plus base verb expresses an intended future action."],
    ],
    [
      [`If the ${noun} event is delayed, the organizers ___ everyone.`, ["will notify", "would notify", "had notified", "notified"], 0, "A real future condition uses if + present and will + base verb."],
      [`If the team had more funding for ${noun}, it ___ the project.`, ["would expand", "will expand", "expanded", "had expand"], 0, "A hypothetical present condition uses if + past and would + base verb."],
      [`Which sentence correctly describes an unreal past result for ${noun}?`, ["If they had checked the schedule, they would have arrived on time.", "If they checked the schedule, they would have arrived on time.", "If they had checked the schedule, they will arrive on time.", "If they check the schedule, they would have arrived on time."], 0, "Third conditional uses if + past perfect and would have + past participle."],
    ],
    [
      [`The student ___ designed the ${noun} poster won an award.`, ["who", "which", "where", "when"], 0, "Who introduces a relative clause referring to a person."],
      [`The room ___ the ${noun} workshop took place is now closed.`, ["where", "who", "whose", "which"], 0, "Where refers to the place of the workshop."],
      [`Which sentence uses a relative clause correctly for ${noun}?`, ["The guide, which was published yesterday, is online.", "The guide, who was published yesterday, is online.", "The guide, where was published yesterday, is online.", "The guide, whose was published yesterday, is online."], 0, "Which refers to a thing; the commas mark extra information."],
    ],
    [
      [`The ${noun} report ___ by the committee yesterday.`, ["was reviewed", "reviewed", "was reviewing", "has review"], 0, "Past passive uses was/were + past participle when the report receives the action."],
      [`New signs for ${noun} ___ next month.`, ["will be installed", "will install", "will be installing", "are install"], 0, "Future passive uses will be + past participle."],
      [`Which sentence about ${noun} uses the passive voice correctly?`, ["The results have been shared with students.", "The results have shared with students.", "The results has been share with students.", "The results were been sharing with students."], 0, "Present perfect passive is have/has been + past participle."],
    ],
    [
      [`The volunteers enjoy ___ on ${noun}.`, ["working", "to work", "work", "worked"], 0, "Enjoy is followed by a gerund (-ing form)."],
      [`The team decided ___ its ${noun} plan.`, ["to revise", "revising", "revise", "revised"], 0, "Decide is followed by a to-infinitive."],
      [`Which sentence has the correct verb pattern for ${noun}?`, ["They avoided making the same mistake.", "They avoided to make the same mistake.", "They avoided make the same mistake.", "They avoided made the same mistake."], 0, "Avoid is followed by a gerund, not an infinitive."],
    ],
    [
      [`The new ${noun} guide is ___ than the old one.`, ["more useful", "most useful", "usefuller", "usefulest"], 0, "Long adjectives such as useful take more in the comparative."],
      [`Of the three ${noun} proposals, this one is ___.`, ["the most practical", "more practical", "the practicaler", "practical"], 0, "Of three options calls for a superlative: the most practical."],
      [`Which comparison about ${noun} is grammatical?`, ["This route is less crowded than that one.", "This route is least crowded than that one.", "This route is less crowded as that one.", "This route is more less crowded than that one."], 0, "Less + adjective + than forms a valid comparison."],
    ],
    [
      [`The ${noun} meeting begins ___ Monday.`, ["on", "in", "at", "by"], 0, "Use on with days of the week."],
      [`The team will meet ___ 3 p.m. to discuss ${noun}.`, ["at", "on", "in", "for"], 0, "Use at with a precise clock time."],
      [`Which sentence uses a time preposition correctly for ${noun}?`, ["The report is due in October.", "The report is due on October.", "The report is due at October.", "The report is due by October 12th on."], 0, "Use in with months when no exact date is given."],
    ],
  ];
  return sets[(day - 1) % sets.length].map(([prompt, choices, correct, explanation]) => question(prompt, choices, correct, explanation, day)) as DailySession["grammar"];
}

function readingPassage(s: DailyScenario, day: number): string {
  const openings = [
    `A small project called ${s.title} began when ${s.group} noticed a practical need in their community. Their aim was to ${s.goal}. Instead of announcing a large permanent program immediately, they set up a limited trial and invited people who would actually use the service to comment on it. The organizers kept notes throughout the trial so that later decisions would reflect observations rather than assumptions.`,
    `When ${s.group} proposed ${s.title}, the idea sounded straightforward: ${s.goal}. In practice, even a modest community project requires careful planning. The organizers first described whom the program was meant to serve, then agreed on a way to notice whether it helped. This early discussion mattered because an attractive idea is not necessarily a useful one until people can test it in ordinary conditions.`,
    `${s.title} was designed by ${s.group} with a clear purpose: ${s.goal}. The team treated its first month as an experiment, not as proof that every part of the plan would succeed. Participants were encouraged to explain what felt confusing or inconvenient. Those comments gave the organizers information they could not have gained from a timetable or a budget alone.`,
  ];
  const middles = [
    `An early difficulty emerged: ${s.challenge}. At first, some team members wanted to continue without changing the design, arguing that people would adapt. Others pointed out that this would make it harder to learn from the trial. After discussing the evidence, the group ${s.action}. This was a targeted change rather than a complete replacement of the original idea.`,
    `The most important obstacle was that ${s.challenge}. The team could have treated this as an isolated complaint, but several participants described the same issue. In response, the organizers ${s.action}. They recorded what happened before and after the change, although they knew that a short trial could not answer every question about long-term performance.`,
    `During the trial, the organizers learned that ${s.challenge}. That detail mattered because it affected how people used the project, not merely how it looked on paper. The team therefore ${s.action}. The adjustment did not require a new goal; it changed the method used to pursue the original one. This distinction helped the organizers explain their decision to participants.`,
  ];
  const endings = [
    `The immediate outcome was encouraging: ${s.result}. Still, the team avoided claiming that a single improvement had solved every problem. Some people had used the service only once, and others had not yet heard about it. The organizers decided to ${s.next} before expanding the program. Their experience suggests that small projects become stronger when feedback is treated as evidence for revision, not as criticism to ignore.`,
    `Afterward, ${s.result}. This observation supported the decision to revise the project, but it did not prove that every participant had the same experience. The next step is to ${s.next}. By naming a specific next step, the team can check whether the improvement lasts rather than relying only on an enthusiastic first impression. The case illustrates the value of testing an idea in context.`,
    `Following the adjustment, ${s.result}. The group was pleased, yet remained cautious: a positive early result is not the same as a final evaluation. It now plans to ${s.next}. That follow-up will give the organizers another opportunity to hear from users and to see whether the change continues to help. For now, the project offers an example of practical planning guided by observation.`,
  ];
  return `${openings[day % 3]}\n\n${middles[(day + 1) % 3]}\n\n${endings[(day + 2) % 3]}`;
}

function listeningLines(s: DailyScenario, day: number): DailySession["listening"]["lines"] {
  const variants = [
    [
      { speaker: "Student", text: `I saw a notice about ${s.title}. What is the main purpose of the project?` },
      { speaker: "Advisor", text: `The organizers want to ${s.goal}. It started as a small trial rather than a permanent service.` },
      { speaker: "Student", text: "Why did they change the original plan after the trial began?" },
      { speaker: "Advisor", text: `They learned that ${s.challenge}, so they ${s.action}.` },
      { speaker: "Student", text: "Did that change make any difference, or is it too early to tell?" },
      { speaker: "Advisor", text: `The early result was that ${s.result}. But the team still wants to ${s.next} before making a bigger decision.` },
    ],
    [
      { speaker: "Student", text: `Is the ${s.title} project still accepting feedback from students?` },
      { speaker: "Advisor", text: `Yes. Its goal is to ${s.goal}, and the organizers want to hear what works in practice.` },
      { speaker: "Student", text: "I thought the first plan had a problem. What happened?" },
      { speaker: "Advisor", text: `The issue was that ${s.challenge}. To address it, they ${s.action}.` },
      { speaker: "Student", text: "So the project is finished now that the change has been made?" },
      { speaker: "Advisor", text: `Not quite. Although ${s.result}, they plan to ${s.next} before deciding whether to expand.` },
    ],
    [
      { speaker: "Student", text: `Could you explain why ${s.title} was created? I missed the introduction.` },
      { speaker: "Advisor", text: `Of course. ${s.group} wanted to ${s.goal}, so they organized a short pilot.` },
      { speaker: "Student", text: "Did the pilot reveal anything unexpected to the organizers?" },
      { speaker: "Advisor", text: `Yes. They found that ${s.challenge}. In response, they ${s.action}.` },
      { speaker: "Student", text: "What will they look at before continuing the project?" },
      { speaker: "Advisor", text: `First, they noticed that ${s.result}. Now they hope to ${s.next} and check whether the improvement continues.` },
    ],
  ];
  return variants[day % 3];
}

function buildSession(s: DailyScenario, day: number): DailySession {
  const odd = day % 2 === 1;
  const passage = readingPassage(s, day);
  const lines = listeningLines(s, day);
  const readingQuestions = [
    question(`What is the main purpose of the ${s.title} passage?`, [`To describe how a project was tested and revised`, `To argue that community projects should never change`, `To compare several unrelated universities`, `To announce that the project has been canceled`], 0, `The passage follows ${s.title} from its goal through feedback, revision, and a proposed next step.`, day),
    question(`Which change did the organizers make during ${s.title}?`, [s.action.charAt(0).toUpperCase() + s.action.slice(1), "They ended the trial without gathering feedback", "They replaced all participants with researchers", "They abandoned the original goal immediately"], 0, `The second paragraph states that the organizers ${s.action}.`, day + 1),
    question(`What can be inferred about the organizers' view of the first result?`, ["They see it as promising but want further evaluation", "They believe one result proves permanent success", "They think participant feedback is unimportant", "They plan to ignore the outcome entirely"], 0, `The final paragraph reports ${s.result}, but also says they plan to ${s.next}.`, day + 2),
  ] as DailySession["reading"]["questions"];
  const listeningQuestions = [
    question(`Why was ${s.title} started?`, [s.goal.charAt(0).toUpperCase() + s.goal.slice(1), "To replace every existing campus program", "To sell tickets to an unrelated event", "To close the project before a trial"], 0, `The advisor says the purpose is to ${s.goal}.`, day + 2),
    question(`What problem did the ${s.title} pilot reveal?`, [s.challenge.charAt(0).toUpperCase() + s.challenge.slice(1), "The project had no stated goal", "The organizers refused to collect any feedback", "The student was asked to cancel the pilot"], 0, `The advisor explains that ${s.challenge}.`, day + 3),
    question(`What does the advisor imply about the next stage of ${s.title}?`, ["The team will investigate further before expanding", "The project has already been permanently canceled", "The initial problem was never addressed", "No one is interested in the result"], 0, `The advisor notes the early result and says the team wants to ${s.next}.`, day),
  ] as DailySession["listening"]["questions"];
  return {
    day,
    theme: s.title,
    grammar: grammar(s, day),
    reading: { title: s.title, passage, questions: readingQuestions },
    listening: { lines, questions: listeningQuestions, audioAssetPath: `/audio/daily/day-${String(day).padStart(2, "0")}.m4a` },
    writing: {
      taskNumber: odd ? 1 : 2,
      prompt: odd
        ? `Write a 50–75 word email to a classmate explaining the purpose of ${s.title}, one difficulty the organizers faced, and whether you would participate. Use a friendly but clear tone.`
        : `Write a 175–225 word opinion essay: should schools and community groups test small projects like ${s.title} before investing in permanent programs? Give a clear position, two reasons, and a relevant example.`,
      minWords: odd ? 50 : 175,
      maxWords: odd ? 75 : 225,
    },
    speaking: {
      taskNumber: odd ? 1 : 2,
      prompt: odd
        ? `Describe a time when you took part in a group activity similar to ${s.title}. What was your role, what challenge did you face, and what did you learn?`
        : `Would you rather support an established program or help create a new one such as ${s.title}? Explain your preference and give specific reasons.`,
      prepSeconds: odd ? 30 : 45,
      responseSeconds: odd ? 45 : 60,
    },
  };
}

export const dailySessions = dailySessionsSchema.parse(scenarios.map((scenario, index) => buildSession(scenario, index + 1)));

export function getDailySession(day: number): DailySession | undefined {
  if (!Number.isInteger(day) || day < 1 || day > 60) return undefined;
  return dailySessions[day - 1];
}
