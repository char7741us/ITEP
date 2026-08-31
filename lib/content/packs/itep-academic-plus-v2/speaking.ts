import type { SpeakingTask } from "@/lib/types/content";

const task1: SpeakingTask = {
  taskNumber: 1,
  title: "Personal Experience",
  prompt: "Describe a place you would like to visit and explain why it interests you.",
  prepSeconds: 30,
  responseSeconds: 45,
};

const task2: SpeakingTask = {
  taskNumber: 2,
  title: "Opinion on a Debate",
  prompt:
    "Some people believe that university education should be free for everyone, while others believe students should pay tuition based on their ability to pay. Which view do you agree with, and why?",
  prepSeconds: 45,
  responseSeconds: 60,
};

export const speakingContent = {
  warmupSeconds: 60,
  tasks: [task1, task2] as [SpeakingTask, SpeakingTask],
};
