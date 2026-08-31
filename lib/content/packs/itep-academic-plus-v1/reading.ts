import type { ReadingPart } from "@/lib/types/content";

const part1: ReadingPart = {
  partNumber: 1,
  passageTitle: "Bees in the City",
  passageText: `Over the past decade, a growing number of city residents have taken up beekeeping, transforming rooftops, balconies, and community gardens into small apiaries. What was once considered an unusual hobby has become a popular way for urban dwellers to connect with nature and support local ecosystems.

Honeybees play a critical role in pollinating flowers, vegetables, and fruit trees, and their presence in cities helps gardens and parks flourish. Municipal governments in several major cities have responded to this trend by easing restrictions on beekeeping and even sponsoring workshops for beginners. In some neighborhoods, local honey has become a point of pride, sold at farmers' markets and used by nearby bakeries and restaurants.

However, urban beekeeping is not without its challenges. Bees kept in cities must compete for food sources in environments with fewer flowering plants than rural areas, and beekeepers often need to supplement their hives with sugar water during lean months. There is also the matter of public perception: some residents worry about being stung, even though most urban bee species are relatively docile and rarely sting unless directly threatened.

Despite these obstacles, many experts believe that urban beekeeping will continue to expand. As cities invest more in green spaces and residents become more aware of the connection between pollinators and food security, keeping bees may shift from a niche pursuit to a mainstream urban practice, much like community gardening has in recent years.`,
  items: [
    {
      id: "r1-q1",
      prompt: "According to the passage, why have some city governments changed their policies on beekeeping?",
      choices: [
        "In response to the growing popularity of urban beekeeping",
        "To reduce the number of bee stings reported each year",
        "Because local honey sales generate significant tax revenue",
        "To force residents to plant more flowering plants",
      ],
      correctIndex: 0,
      explanation:
        "The passage states that municipal governments 'responded to this trend' — the growing popularity of urban beekeeping — by easing restrictions and sponsoring workshops.",
    },
    {
      id: "r1-q2",
      prompt: "What is one challenge urban beekeepers face, according to the passage?",
      choices: [
        "Legal restrictions prevent most people from keeping bees",
        "Local honey cannot legally be sold at markets",
        "Urban bee species are more aggressive than rural ones",
        "Bees in cities may not find enough natural food sources",
      ],
      correctIndex: 3,
      explanation:
        "The passage says bees 'must compete for food sources in environments with fewer flowering plants,' requiring supplemental feeding.",
    },
    {
      id: "r1-q3",
      prompt: 'The word "docile" in paragraph 3 is closest in meaning to:',
      choices: ["aggressive", "calm", "unpredictable", "rare"],
      correctIndex: 1,
      explanation:
        "In context, 'docile' describes bees that 'rarely sting unless directly threatened' — meaning calm or gentle.",
    },
    {
      id: "r1-q4",
      prompt: "What does the author suggest about the future of urban beekeeping?",
      choices: [
        "It will likely disappear as cities become more developed",
        "Governments will eventually ban it due to safety concerns",
        "It may become as common as community gardening",
        "It will remain a niche hobby practiced by very few people",
      ],
      correctIndex: 2,
      explanation:
        "The final paragraph compares the likely trajectory of beekeeping to community gardening, which has become mainstream.",
    },
  ],
};

const part2: ReadingPart = {
  partNumber: 2,
  passageTitle: "Sleep and the Architecture of Memory",
  passageText: `For much of the twentieth century, sleep was regarded by many scientists as a passive state, a period during which the brain simply powered down to conserve energy. Over the last several decades, however, an increasing body of neuroscientific research has overturned this assumption, revealing that sleep is in fact a highly active process essential to learning and memory.

Central to this research is the concept of memory consolidation, the process by which newly acquired information is stabilized and integrated into long-term memory. Studies using functional imaging techniques have shown that during certain stages of sleep, particularly slow-wave sleep, the hippocampus — a brain structure crucial for forming new memories — replays patterns of neural activity that occurred during waking experience. This replay appears to strengthen the connections between neurons, gradually transferring information from the hippocampus to the neocortex, where it can be stored more permanently. Without adequate sleep, this transfer is thought to be incomplete, leaving memories more fragile and susceptible to interference.

Rapid eye movement (REM) sleep, the stage most closely associated with vivid dreaming, appears to play a complementary role. Rather than consolidating factual information, REM sleep is believed to be particularly important for integrating new memories with existing knowledge and for supporting creative problem-solving. Researchers have observed that participants who are allowed to sleep, and especially to experience REM sleep, after learning a task often perform better on tests of insight and pattern recognition than those who remain awake for an equivalent period.

These findings have significant implications beyond the laboratory. Sleep researchers have grown increasingly concerned about the effects of chronic sleep restriction, particularly among adolescents and young adults, whose academic and professional demands often come at the expense of adequate rest. Some educational institutions have begun to adjust school start times in response to evidence suggesting that later schedules align more closely with adolescents' natural sleep cycles and may improve academic performance.

Critics of this research caution against oversimplifying the relationship between sleep and memory. They note that most studies rely on controlled laboratory conditions that may not fully capture the complexity of sleep in everyday life, and that individual variation in sleep needs makes it difficult to establish universal guidelines. Nevertheless, the broader consensus among sleep scientists is unambiguous: sleep is not merely a byproduct of a tired brain but an active, structured process that plays an indispensable role in how humans learn, remember, and think creatively. As this understanding becomes more widespread, it may reshape not only educational policy but also broader cultural attitudes toward the value of rest.`,
  items: [
    {
      id: "r2-q1",
      prompt: "According to the passage, how did scientists traditionally view sleep?",
      choices: [
        "As a passive state used mainly to conserve energy",
        "As an active process necessary for creativity",
        "As a stage primarily devoted to memory consolidation",
        "As a period of heightened neural activity",
      ],
      correctIndex: 0,
      explanation:
        "The first paragraph states sleep 'was regarded by many scientists as a passive state... to conserve energy.'",
    },
    {
      id: "r2-q2",
      prompt: "What role does the hippocampus play during slow-wave sleep, according to the passage?",
      choices: [
        "It suppresses neural activity to allow the brain to rest",
        "It generates the vivid dreams associated with REM sleep",
        "It transfers control of memory entirely to the neocortex within minutes",
        "It replays patterns of activity from waking experience to strengthen memories",
      ],
      correctIndex: 3,
      explanation:
        "Paragraph 2 explains the hippocampus 'replays patterns of neural activity that occurred during waking experience,' strengthening neural connections.",
    },
    {
      id: "r2-q3",
      prompt: "Based on the passage, what is a key difference between slow-wave sleep and REM sleep?",
      choices: [
        "REM sleep is more important for factual memory, while slow-wave sleep supports creativity",
        "Slow-wave sleep supports consolidating factual information, while REM sleep aids integration and creative insight",
        "REM sleep occurs only in adolescents, while slow-wave sleep occurs at all ages",
        "Slow-wave sleep is associated with dreaming, while REM sleep is dreamless",
      ],
      correctIndex: 1,
      explanation:
        "Paragraph 3 contrasts REM sleep's role in integration and creative problem-solving with slow-wave sleep's role in consolidating factual information.",
    },
    {
      id: "r2-q4",
      prompt: "Why have some schools adjusted their start times, according to the passage?",
      choices: [
        "To reduce transportation costs for families",
        "In response to complaints from teachers about early mornings",
        "Because later schedules better match adolescents' natural sleep cycles",
        "Because research shows students prefer afternoon classes",
      ],
      correctIndex: 2,
      explanation:
        "Paragraph 4 states schools adjusted start times because later schedules 'align more closely with adolescents' natural sleep cycles.'",
    },
    {
      id: "r2-q5",
      prompt: "What concern do critics raise about sleep and memory research?",
      choices: [
        "That laboratory conditions may not reflect the complexity of real-life sleep",
        "That sleep has no measurable effect on memory at all",
        "That REM sleep research has been proven entirely inaccurate",
        "That memory consolidation occurs only during wakefulness",
      ],
      correctIndex: 0,
      explanation:
        "The final paragraph notes critics caution that 'controlled laboratory conditions... may not fully capture the complexity of sleep in everyday life.'",
    },
    {
      id: "r2-q6",
      prompt: 'The word "indispensable" in the final paragraph is closest in meaning to:',
      choices: ["optional", "questionable", "temporary", "essential"],
      correctIndex: 3,
      explanation:
        "The passage describes sleep as playing an 'indispensable role' — meaning it cannot be done without, i.e., essential.",
    },
  ],
};

export const readingContent = {
  totalTimeSeconds: 25 * 60,
  parts: [part1, part2] as [ReadingPart, ReadingPart],
};
