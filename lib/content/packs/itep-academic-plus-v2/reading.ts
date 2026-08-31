import type { ReadingPart } from "@/lib/types/content";

const part1: ReadingPart = {
  partNumber: 1,
  passageTitle: "Repair Cafés: Fixing More Than Just Objects",
  passageText: `In cities around the world, a quiet movement has been gaining momentum: the repair café. These informal gatherings bring together volunteers with technical skills and members of the public who have broken appliances, torn clothing, or malfunctioning electronics. Rather than throwing these items away, visitors sit down with a volunteer repairer and try to fix the problem together.

The concept began in the Netherlands in 2009 and has since spread to thousands of locations worldwide. Unlike a traditional repair shop, no money changes hands at a repair café; the goal is not profit but skill-sharing and waste reduction. Visitors often leave not only with a working toaster or a mended shirt, but also with a new understanding of how the object functions.

Environmental advocates have praised repair cafés as a practical response to the culture of disposability that dominates modern consumer habits. Manufacturing new products consumes significant energy and raw materials, and much of what ends up in landfills could have been fixed with a little guidance. By making repair accessible and social, these events also address a less obvious barrier: many people simply do not know anyone who could show them how to solve a small mechanical or electrical problem.

Some critics note that repair cafés cannot keep pace with the sheer volume of goods discarded each year, and that manufacturers should be doing more to design products that last longer and are easier to repair in the first place. Even so, organizers argue that every appliance saved from the trash, and every skill passed on to a new volunteer, represents a small but meaningful shift away from a throwaway culture.`,
  items: [
    {
      id: "r1-q1",
      prompt: "What is the main purpose of a repair café, according to the passage?",
      choices: [
        "To sell repaired items at a profit",
        "To collect donations for people in need",
        "To train professional repair technicians",
        "To help people fix broken items and learn repair skills",
      ],
      correctIndex: 3,
      explanation: "The passage states the goal 'is not profit but skill-sharing and waste reduction,' achieved by helping people fix items together.",
    },
    {
      id: "r1-q2",
      prompt: "How does a repair café differ from a traditional repair shop?",
      choices: [
        "No money is exchanged for the repair service",
        "It only repairs electronics, not clothing",
        "It charges higher prices for repairs",
        "It only operates in the Netherlands",
      ],
      correctIndex: 0,
      explanation: "The passage explicitly says 'no money changes hands at a repair café,' unlike a traditional repair shop.",
    },
    {
      id: "r1-q3",
      prompt: "According to the passage, what is one barrier repair cafés help address?",
      choices: [
        "The high cost of new appliances",
        "A lack of environmental regulations",
        "Not knowing anyone who could show you how to fix something",
        "A shortage of raw materials for manufacturing",
      ],
      correctIndex: 2,
      explanation: "The passage names this 'less obvious barrier': 'many people simply do not know anyone who could show them how to solve' a repair problem.",
    },
    {
      id: "r1-q4",
      prompt: "What criticism do some critics raise about repair cafés?",
      choices: [
        "They charge too much for their services",
        "They cannot keep up with the amount of goods discarded each year",
        "They discourage people from buying new products",
        "They are not popular outside the Netherlands",
      ],
      correctIndex: 1,
      explanation: "The final paragraph notes critics say repair cafés 'cannot keep pace with the sheer volume of goods discarded each year.'",
    },
  ],
};

const part2: ReadingPart = {
  partNumber: 2,
  passageTitle: "The Placebo Effect and the Power of Expectation",
  passageText: `For decades, the placebo effect was treated by medical researchers as a nuisance — a confounding variable to be controlled for in clinical trials rather than a phenomenon worthy of study in its own right. A placebo, typically an inert substance such as a sugar pill, should in theory produce no physiological effect. Yet patients who receive placebos frequently report genuine improvements in symptoms ranging from pain to depression to Parkinson's disease, and in some cases these improvements are measurable through objective physiological markers, not merely self-reported feelings.

Recent research in neuroscience has begun to clarify the mechanisms behind this effect. Brain imaging studies show that administering a placebo for pain relief activates the same neural pathways — including the release of endogenous opioids — that are triggered by actual analgesic drugs. In other words, the expectation of relief appears to trigger the brain's own pharmacy, prompting it to produce chemicals that genuinely reduce the perception of pain. This is not a matter of patients imagining that they feel better; measurable biological processes are involved.

The strength of the placebo effect appears to depend heavily on context. Larger pills produce a stronger placebo effect than smaller ones, and capsules tend to outperform tablets. Injections, perceived as more invasive and therefore more powerful, generate a stronger response than oral medication. Even the color of a pill has been shown to influence outcomes, with warm colors like red and orange more strongly associated with stimulant effects, and cooler colors like blue linked to sedative effects. Perhaps most strikingly, the relationship between doctor and patient plays a substantial role: patients who receive a placebo from a physician who communicates warmth, confidence, and attentiveness tend to show significantly better outcomes than those who receive an identical placebo from a more detached practitioner.

These findings raise complex ethical questions. If a doctor's demeanor can measurably improve patient outcomes independent of any active drug, should clinical training place greater emphasis on the therapeutic value of the patient-provider relationship itself? Some researchers argue that harnessing the placebo response ethically, without resorting to deception, could become a legitimate component of medical care by openly incorporating ritual, attention, and reassurance into treatment.

Critics caution against overstating these findings. The placebo effect is generally more pronounced for subjective symptoms like pain and nausea than for conditions with clear biological markers, such as tumor size or bacterial infection; no amount of expectation will shrink a tumor or cure a bacterial infection outright. Nevertheless, the growing body of evidence suggests that the mind's expectations are not merely a psychological curiosity but an active participant in the body's physiological response to treatment — an insight that is gradually reshaping how researchers think about the boundary between mind and body in medicine.`,
  items: [
    {
      id: "r2-q1",
      prompt: "According to the passage, how did medical researchers traditionally view the placebo effect?",
      choices: [
        "As an interference to be controlled for in trials, not studied itself",
        "As a powerful treatment worth studying independently",
        "As a purely imaginary phenomenon with no physiological basis",
        "As a technique used mainly in clinical treatment of Parkinson's",
      ],
      correctIndex: 0,
      explanation: "The passage says the placebo effect 'was treated by medical researchers as a nuisance — a confounding variable to be controlled for.'",
    },
    {
      id: "r2-q2",
      prompt: "What do brain imaging studies suggest about placebos and pain relief?",
      choices: [
        "Placebos have no measurable effect on the brain",
        "Placebos only work for patients who are told they are receiving a placebo",
        "Placebos work only by distracting the patient's attention from the pain",
        "Placebos activate the same neural pathways as actual pain-relief drugs",
      ],
      correctIndex: 3,
      explanation: "Brain imaging shows placebos 'activate the same neural pathways... that are triggered by actual analgesic drugs.'",
    },
    {
      id: "r2-q3",
      prompt: "According to the passage, which of the following increases the strength of a placebo effect?",
      choices: [
        "Using smaller pills instead of larger ones",
        "A physician's warmth, confidence, and attentiveness",
        "Using tablets instead of capsules",
        "Avoiding any explanation of the treatment to the patient",
      ],
      correctIndex: 1,
      explanation: "The passage says patients whose physician communicates 'warmth, confidence, and attentiveness' show significantly better outcomes.",
    },
    {
      id: "r2-q4",
      prompt: "What ethical question do these findings raise, according to the passage?",
      choices: [
        "Whether doctors should be allowed to prescribe placebos as replacements for all medication",
        "Whether patients should be charged less for placebo treatments",
        "Whether medical training should give more weight to the therapeutic value of the patient-provider relationship",
        "Whether placebo studies should be banned entirely for ethical reasons",
      ],
      correctIndex: 2,
      explanation: "The passage asks 'should clinical training place greater emphasis on the therapeutic value of the patient-provider relationship itself?'",
    },
    {
      id: "r2-q5",
      prompt: "According to the passage, for which type of condition is the placebo effect generally weaker?",
      choices: [
        "Chronic pain",
        "Nausea",
        "Depression",
        "Conditions with clear biological markers, like tumor size",
      ],
      correctIndex: 3,
      explanation: "The passage says the effect is 'more pronounced for subjective symptoms... than for conditions with clear biological markers, such as tumor size.'",
    },
    {
      id: "r2-q6",
      prompt: 'The word "confounding" in the first paragraph is closest in meaning to:',
      choices: ["complicating", "clarifying", "irrelevant", "beneficial"],
      correctIndex: 0,
      explanation: "A 'confounding variable' is one that complicates interpretation of results by introducing an alternative explanation.",
    },
  ],
};

export const readingContent = {
  totalTimeSeconds: 25 * 60,
  parts: [part1, part2] as [ReadingPart, ReadingPart],
};
