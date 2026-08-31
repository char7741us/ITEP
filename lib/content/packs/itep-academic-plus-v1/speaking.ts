import type { SpeakingTask } from "@/lib/types/content";

const task1: SpeakingTask = {
  taskNumber: 1,
  title: "Personal Experience",
  prompt: "Describe a skill you learned recently and explain why you decided to learn it.",
  prepSeconds: 30,
  responseSeconds: 45,
};

const task2: SpeakingTask = {
  taskNumber: 2,
  title: "Opinion on a Debate",
  prompt:
    "Some people think that employees should be required to work in an office every day, while others believe employees should be free to choose between working remotely and working in an office. Which view do you agree with, and why?",
  prepSeconds: 45,
  responseSeconds: 60,
};

export const speakingContent = {
  warmupSeconds: 60,
  tasks: [task1, task2] as [SpeakingTask, SpeakingTask],
};
