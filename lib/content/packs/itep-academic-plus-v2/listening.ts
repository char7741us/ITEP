import type { ListeningPart } from "@/lib/types/content";

const part1: ListeningPart = {
  partNumber: 1,
  title: "Short Dialogues",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p1-d1.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Man", text: "Have you seen my keys? I'm going to be late." },
        { speaker: "Woman", text: "Check the kitchen counter — I think I saw them there this morning." },
      ],
      items: [
        {
          id: "l1-d1-q1",
          prompt: "What does the woman suggest?",
          choices: ["Call a locksmith", "Buy new keys", "Look in the kitchen", "Wait for him to find them himself"],
          correctIndex: 2,
          explanation: "The woman says to 'check the kitchen counter,' i.e., look in the kitchen.",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p1-d2.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Woman", text: "The client moved the meeting to 3 PM instead of 2." },
        { speaker: "Man", text: "Good, that gives me time to finish the slides first." },
      ],
      items: [
        {
          id: "l1-d2-q1",
          prompt: "How does the man react to the schedule change?",
          choices: [
            "He is pleased because it gives him more time",
            "He is frustrated by the delay",
            "He is worried he'll miss the meeting",
            "He asks to reschedule again",
          ],
          correctIndex: 0,
          explanation: "The man says 'Good, that gives me time to finish the slides first' — a positive reaction.",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p1-d3.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Man", text: "This coffee shop is always so crowded on Mondays." },
        { speaker: "Woman", text: "Let's just get it to go and eat at the park instead." },
      ],
      items: [
        {
          id: "l1-d3-q1",
          prompt: "What does the woman propose?",
          choices: [
            "Finding a different coffee shop",
            "Coming back later in the day",
            "Skipping coffee altogether",
            "Getting coffee to go and eating elsewhere",
          ],
          correctIndex: 3,
          explanation: "The woman suggests getting it 'to go and eat at the park instead.'",
        },
      ],
    },
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p1-d4.wav",
      durationSeconds: 10,
      audioScript: [
        { speaker: "Woman", text: "Did the package finally arrive?" },
        { speaker: "Man", text: "Not yet, but the tracking says it's out for delivery today." },
      ],
      items: [
        {
          id: "l1-d4-q1",
          prompt: "What does the man say about the package?",
          choices: ["It was lost by the courier", "It is expected to arrive today", "It arrived yesterday", "It was returned to the sender"],
          correctIndex: 1,
          explanation: "The man says tracking shows it's 'out for delivery today.'",
        },
      ],
    },
  ],
};

const part2: ListeningPart = {
  partNumber: 2,
  title: "Conversation: Organizing a Training Session",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p2-conversation.wav",
      durationSeconds: 150,
      audioScript: [
        { speaker: "Sam", text: "Priya, have you finalized the schedule for the new-hire training next week?" },
        { speaker: "Priya", text: "Almost. I'm still waiting to hear back from the IT department about room availability." },
        { speaker: "Sam", text: "If the usual room isn't free, we could always use the conference room on the fourth floor." },
        { speaker: "Priya", text: "That could work, but it's smaller — we might need to split the group into two sessions instead." },
        { speaker: "Sam", text: "That's fine, as long as we cover the same material both times. Who's presenting the compliance section?" },
        { speaker: "Priya", text: "I asked Marcus, but he's traveling that week, so I'm thinking of asking Elena instead." },
        { speaker: "Sam", text: "Elena would be great — she ran that section last year and got really positive feedback." },
        { speaker: "Priya", text: "Perfect, I'll reach out to her today. Do you want to handle the technical systems walkthrough, like last time?" },
        { speaker: "Sam", text: "Sure, I can do that. Should I prepare updated slides, or can I reuse last year's?" },
        { speaker: "Priya", text: "Definitely update them — a few of the systems have changed since then." },
        { speaker: "Sam", text: "Got it. I'll have a draft ready by Thursday for you to review." },
      ],
      items: [
        {
          id: "l2-q1",
          prompt: "What are Sam and Priya mainly organizing?",
          choices: ["A performance review", "A training session for new hires", "A department budget meeting", "A client presentation"],
          correctIndex: 1,
          explanation: "The conversation is about finalizing the schedule for 'the new-hire training next week.'",
        },
        {
          id: "l2-q2",
          prompt: "Why might the training need to be split into two sessions?",
          choices: [
            "Too many topics need to be covered",
            "Marcus is unavailable that week",
            "IT has not approved the schedule",
            "The available room is smaller than usual",
          ],
          correctIndex: 3,
          explanation: "Priya says the fourth-floor room 'is smaller — we might need to split the group into two sessions instead.'",
        },
        {
          id: "l2-q3",
          prompt: "Why does Priya want to ask Elena to present the compliance section?",
          choices: [
            "Elena presented it successfully last year",
            "Elena has more seniority than Marcus",
            "Elena volunteered for the assignment",
            "Elena works in the IT department",
          ],
          correctIndex: 0,
          explanation: "Sam notes Elena 'ran that section last year and got really positive feedback.'",
        },
        {
          id: "l2-q4",
          prompt: "What does Sam agree to do before Thursday?",
          choices: ["Book the conference room", "Contact Elena about presenting", "Prepare a draft of updated slides", "Finalize the new-hire schedule"],
          correctIndex: 2,
          explanation: "Sam says 'I'll have a draft ready by Thursday for you to review,' referring to the updated slides.",
        },
      ],
    },
  ],
};

const part3: ListeningPart = {
  partNumber: 3,
  title: "Lecture: The Science of Procrastination",
  segments: [
    {
      audioAssetPath: "/audio/itep-academic-plus-alt/1.0.0/listening-p3-lecture.wav",
      durationSeconds: 270,
      audioScript: [
        { speaker: "Professor", text: "Good afternoon. Today's topic is one that, ironically, I put off preparing until the last minute: procrastination." },
        { speaker: "Professor", text: "For a long time, procrastination was dismissed as simple laziness or poor time management. But research in psychology over the past two decades paints a very different picture. Procrastination is now understood primarily as an emotion-regulation problem, not a time-management problem. When we put off a task, we are usually avoiding the unpleasant feelings associated with it — anxiety, boredom, self-doubt, or frustration — rather than avoiding the task itself." },
        { speaker: "Professor", text: "This reframing matters because it explains why simply telling someone to 'just start' rarely works. If procrastination were purely about scheduling, better planning tools would have solved the problem decades ago. Instead, the behavior persists because avoidance provides immediate emotional relief, even though it creates greater stress later. This is what researchers call a present bias: our brains consistently overvalue immediate comfort relative to future consequences." },
        { speaker: "Professor", text: "Interestingly, studies show that self-compassion, not self-criticism, is one of the most effective tools for reducing procrastination. Students who forgive themselves for procrastinating on a previous task are less likely to procrastinate on the next one. Harsh self-criticism, by contrast, increases the negative emotions associated with the task, which paradoxically fuels further avoidance." },
        { speaker: "Professor", text: "Environmental design also plays a meaningful role. Reducing the number of steps between a person and a task — for example, leaving running shoes by the door the night before a morning run — lowers the emotional friction associated with starting. Conversely, adding friction to distracting behaviors, such as logging out of social media accounts, can meaningfully reduce procrastination triggers." },
        { speaker: "Professor", text: "Finally, it's worth noting that not all delay is procrastination. Deliberately postponing a decision to gather more information reflects sound judgment rather than avoidance. The defining feature of procrastination is that the delay is voluntary, unnecessary, and ultimately harmful to the person's own goals — done despite knowing it will likely make things worse." },
      ],
      items: [
        {
          id: "l3-q1",
          prompt: "According to the lecture, how was procrastination traditionally viewed?",
          choices: [
            "As an emotion-regulation problem",
            "As a normal and harmless habit",
            "As a purely biological condition",
            "As a sign of poor character or laziness",
          ],
          correctIndex: 3,
          explanation: "The professor says procrastination 'was dismissed as simple laziness or poor time management.'",
        },
        {
          id: "l3-q2",
          prompt: "What does the professor say procrastination is now understood to be primarily about?",
          choices: ["Poor scheduling skills", "Avoiding unpleasant emotions associated with a task", "A lack of intelligence", "An inability to set goals"],
          correctIndex: 1,
          explanation: "The professor calls it 'primarily an emotion-regulation problem,' about avoiding unpleasant feelings, not the task itself.",
        },
        {
          id: "l3-q3",
          prompt: "Why does the professor say that 'just start' advice often fails?",
          choices: [
            "Because most people do not understand the advice",
            "Because it only works for very short tasks",
            "Because it does not address the emotional avoidance behind procrastination",
            "Because it requires expensive planning tools",
          ],
          correctIndex: 2,
          explanation: "The professor explains the behavior persists because of emotional avoidance, which 'just start' advice doesn't address.",
        },
        {
          id: "l3-q4",
          prompt: "According to the lecture, what effect does self-compassion have on procrastination?",
          choices: [
            "It tends to reduce procrastination on future tasks",
            "It has no measurable effect",
            "It tends to increase procrastination",
            "It only helps with academic tasks, not other tasks",
          ],
          correctIndex: 0,
          explanation: "Students who forgive themselves 'are less likely to procrastinate on the next' task.",
        },
        {
          id: "l3-q5",
          prompt: 'What example does the professor give of reducing "friction" to start a task?',
          choices: ["Setting stricter deadlines", "Increasing self-criticism after a delay", "Scheduling tasks further in advance", "Leaving running shoes by the door the night before"],
          correctIndex: 3,
          explanation: "The professor gives this exact example: 'leaving running shoes by the door the night before a morning run.'",
        },
        {
          id: "l3-q6",
          prompt: "According to the professor, what distinguishes procrastination from a strategic delay?",
          choices: [
            "Procrastination always involves social media use",
            "Procrastination is voluntary, unnecessary, and harmful to one's own goals",
            "Strategic delay is always shorter in duration",
            "Strategic delay never involves gathering more information",
          ],
          correctIndex: 1,
          explanation: "The professor defines procrastination as delay that is 'voluntary, unnecessary, and ultimately harmful to the person's own goals.'",
        },
      ],
    },
  ],
};

export const listeningContent = {
  totalTimeSeconds: 20 * 60,
  parts: [part1, part2, part3] as [ListeningPart, ListeningPart, ListeningPart],
};
