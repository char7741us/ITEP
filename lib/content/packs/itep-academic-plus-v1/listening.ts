import type { ListeningPart } from "@/lib/types/content";

const part1: ListeningPart = {
  partNumber: 1,
  title: "Short Dialogues",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p1-d1.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Woman", text: "Did you finish the budget report?" },
        { speaker: "Man", text: "Almost — I just need to double-check the numbers in the last section." },
      ],
      items: [
        {
          id: "l1-d1-q1",
          prompt: "What does the man still need to do?",
          choices: [
            "Verify some figures",
            "Start the report from scratch",
            "Submit the report to his manager",
            "Ask a colleague for help",
          ],
          correctIndex: 0,
          explanation: "The man says he needs to 'double-check the numbers,' meaning verify some figures.",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p1-d2.wav",
      durationSeconds: 11,
      audioScript: [
        { speaker: "Man", text: "I heard the flight got delayed again." },
        { speaker: "Woman", text: "Yeah, now it's not leaving until nine. We should probably just get some dinner while we wait." },
      ],
      items: [
        {
          id: "l1-d2-q1",
          prompt: "What do the speakers decide to do?",
          choices: ["Cancel their flight", "Eat while they wait", "Complain to airline staff", "Book a different flight"],
          correctIndex: 1,
          explanation: "The woman suggests getting dinner while they wait for the delayed flight.",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p1-d3.wav",
      durationSeconds: 9,
      audioScript: [
        { speaker: "Woman", text: "Could you turn the music down a little? I'm trying to concentrate." },
        { speaker: "Man", text: "Oh, sorry, I didn't realize it was that loud." },
      ],
      items: [
        {
          id: "l1-d3-q1",
          prompt: "Why does the woman make her request?",
          choices: ["She wants to take a phone call", "She doesn't like the song", "She is trying to focus on something", "She has a headache"],
          correctIndex: 2,
          explanation: "The woman says she is 'trying to concentrate,' i.e., trying to focus.",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p1-d4.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Man", text: "This printer has been jamming all morning." },
        { speaker: "Woman", text: "Try the one on the third floor — ours got fixed yesterday." },
      ],
      items: [
        {
          id: "l1-d4-q1",
          prompt: "What does the woman suggest?",
          choices: ["Repairing the printer immediately", "Buying a new printer", "Calling technical support", "Using a different printer"],
          correctIndex: 3,
          explanation: "The woman suggests trying the printer 'on the third floor' instead — a different printer.",
        },
      ],
    },
  ],
};

const part2: ListeningPart = {
  partNumber: 2,
  title: "Conversation: Planning a Client Presentation",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p2-conversation.wav",
      durationSeconds: 150,
      audioScript: [
        { speaker: "Tom", text: "Maria, do you have a few minutes to go over the client presentation for Thursday?" },
        { speaker: "Maria", text: "Sure. I've drafted the first few slides, but I'm not sure how much detail to include about the pricing structure." },
        { speaker: "Tom", text: "I'd keep it fairly high-level for the first meeting. We don't want to overwhelm them before they've even agreed to the partnership." },
        { speaker: "Maria", text: "That makes sense. Should we still include the comparison chart with our competitors?" },
        { speaker: "Tom", text: "Definitely — that's usually what convinces clients to move forward. Just make sure the data's up to date. Marketing sent over new figures last week." },
        { speaker: "Maria", text: "Right, I'll update that section today. What about the timeline slide? Should I include the six-month rollout plan or just the first phase?" },
        { speaker: "Tom", text: "Just the first phase for now. If they're interested, we can share the full plan in a follow-up meeting." },
        { speaker: "Maria", text: "Okay. One more thing — do you want to present the technical section, or should I handle that too?" },
        { speaker: "Tom", text: "I'll take the technical part since I worked more closely with the engineering team. You can focus on the overview and the pricing." },
        { speaker: "Maria", text: "Sounds good. I'll send you the updated draft by tomorrow afternoon so you can review it before Thursday." },
        { speaker: "Tom", text: "Perfect. Thanks, Maria." },
      ],
      items: [
        {
          id: "l2-q1",
          prompt: "What are Tom and Maria mainly discussing?",
          choices: ["A budget proposal for their department", "Preparations for a client presentation", "A new company policy", "Feedback from a previous meeting"],
          correctIndex: 1,
          explanation: "The whole conversation is about preparing slides and content for a presentation to a client on Thursday.",
        },
        {
          id: "l2-q2",
          prompt: "According to Tom, how much detail should the pricing section include at this stage?",
          choices: ["A complete breakdown of every cost", "No pricing information at all", "A comparison with last year's prices", "Only a high-level overview"],
          correctIndex: 3,
          explanation: "Tom says to 'keep it fairly high-level for the first meeting.'",
        },
        {
          id: "l2-q3",
          prompt: "Why does Tom want to include the competitor comparison chart?",
          choices: ["It usually persuades clients to move forward", "It is required by company policy", "The client specifically requested it", "It was created by the marketing department last year"],
          correctIndex: 0,
          explanation: "Tom says the chart is 'usually what convinces clients to move forward.'",
        },
        {
          id: "l2-q4",
          prompt: "What will Tom be responsible for in the presentation?",
          choices: ["The pricing overview", "The six-month rollout plan", "The technical section", "The competitor comparison"],
          correctIndex: 2,
          explanation: "Tom says 'I'll take the technical part since I worked more closely with the engineering team.'",
        },
      ],
    },
  ],
};

const part3: ListeningPart = {
  partNumber: 3,
  title: "Lecture: How Habits Form in the Brain",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus/1.0.0/listening-p3-lecture.wav",
      durationSeconds: 280,
      audioScript: [
        { speaker: "Professor", text: "Good afternoon, everyone. Today I want to talk about how habits form in the brain, and why they can be so difficult to change once they're established." },
        { speaker: "Professor", text: "Psychologists often describe habit formation using a three-part model called the habit loop. The first part is the cue, some kind of trigger in the environment — it might be a time of day, a location, or an emotional state — that tells the brain to go into automatic mode. The second part is the routine itself, the behavior that follows the cue. And the third part is the reward, the benefit the brain receives from performing that behavior." },
        { speaker: "Professor", text: "What's interesting from a neurological perspective is where this process takes place in the brain. Early in the learning process, when a behavior is still new, it requires significant activity in the prefrontal cortex — the region responsible for decision-making and conscious thought. But as a behavior is repeated, activity gradually shifts toward a structure deep in the brain called the basal ganglia, which is associated with automatic, largely unconscious processes." },
        { speaker: "Professor", text: "This shift has an important consequence: habits are remarkably resistant to change through willpower alone, because willpower relies on the prefrontal cortex, while the habit itself now lives largely outside of it." },
        { speaker: "Professor", text: "So what does work, according to researchers? One of the most consistently supported strategies is not eliminating the habit loop, but modifying it — specifically, keeping the same cue and reward, but substituting a different routine in between." },
        { speaker: "Professor", text: "Environmental design also plays a substantial role. Because cues are often external, changing one's surroundings can disrupt the automatic triggering of a habit before a new routine has had time to take hold. This is one reason people often find it easier to change habits when they move to a new home or start a new job — the old cues simply aren't present anymore." },
        { speaker: "Professor", text: "Finally, it's worth noting that habit formation isn't inherently negative. The same mechanisms that make bad habits so persistent are also what allow us to develop expertise, efficiency, and consistency in valuable behaviors. Understanding the mechanics of the habit loop, then, isn't just about breaking unwanted patterns; it's about deliberately designing the automatic behaviors that will serve us well over the long term." },
      ],
      items: [
        {
          id: "l3-q1",
          prompt: "According to the lecture, what are the three parts of the habit loop?",
          choices: ["Trigger, decision, action", "Emotion, behavior, consequence", "Stimulus, response, memory", "Cue, routine, reward"],
          correctIndex: 3,
          explanation: "The professor names the three-part model as 'cue... routine... and reward.'",
        },
        {
          id: "l3-q2",
          prompt: "What happens in the brain as a behavior becomes a well-established habit?",
          choices: [
            "Activity shifts from the prefrontal cortex to the basal ganglia",
            "Activity shifts from the basal ganglia to the prefrontal cortex",
            "The prefrontal cortex becomes permanently inactive",
            "The basal ganglia stops processing the behavior entirely",
          ],
          correctIndex: 0,
          explanation: "The lecture says activity 'gradually shifts toward... the basal ganglia' as behavior is repeated.",
        },
        {
          id: "l3-q3",
          prompt: "According to the professor, why is willpower often ineffective at breaking habits?",
          choices: [
            "Willpower and habits are controlled by the exact same brain region",
            "Habits require more willpower than the brain can typically produce",
            "Willpower relies on the prefrontal cortex, while established habits operate largely outside it",
            "Willpower only works for habits related to physical activity",
          ],
          correctIndex: 2,
          explanation: "The professor explains willpower 'relies on the prefrontal cortex, while the habit itself now lives largely outside of it.'",
        },
        {
          id: "l3-q4",
          prompt: "What strategy does the lecture describe as more effective than simply eliminating a habit?",
          choices: [
            "Removing the reward entirely",
            "Keeping the same cue and reward but changing the routine",
            "Ignoring the cue until it disappears",
            "Avoiding all triggers permanently",
          ],
          correctIndex: 1,
          explanation: "The professor recommends 'keeping the same cue and reward, but substituting a different routine.'",
        },
        {
          id: "l3-q5",
          prompt: "Why might changing environments make it easier to change a habit, according to the lecture?",
          choices: [
            "New environments automatically improve willpower",
            "New homes contain fewer distractions than old ones",
            "Moving forces people to form entirely new reward systems",
            "The original cues that triggered the habit are no longer present",
          ],
          correctIndex: 3,
          explanation: "The professor says that in a new environment, 'the old cues simply aren't present anymore.'",
        },
        {
          id: "l3-q6",
          prompt: "What point does the professor make at the end of the lecture?",
          choices: [
            "The mechanisms behind habits also enable useful skills like expertise",
            "Habits are almost always harmful and should be eliminated",
            "Only musicians and surgeons benefit from strong habits",
            "Habit formation cannot be intentionally designed",
          ],
          correctIndex: 0,
          explanation: "The professor concludes that the same mechanisms 'allow us to develop expertise, efficiency, and consistency in valuable behaviors.'",
        },
      ],
    },
  ],
};

export const listeningContent = {
  totalTimeSeconds: 20 * 60,
  parts: [part1, part2, part3] as [ListeningPart, ListeningPart, ListeningPart],
};
