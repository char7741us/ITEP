import type { WritingTask } from "@/lib/types/content";

const task1: WritingTask = {
  taskNumber: 1,
  title: "Short Message",
  prompt:
    "Write a short message to a colleague letting them know you will be working from home tomorrow and asking them to cover a scheduled client call on your behalf.",
  minWords: 50,
  maxWords: 75,
  timeLimitSeconds: 5 * 60,
};

const task2: WritingTask = {
  taskNumber: 2,
  title: "Opinion Essay",
  prompt:
    "Some people believe that social media has a mostly positive impact on how people stay connected, while others believe it does more harm than good to real relationships. Discuss both views and give your own opinion.",
  minWords: 175,
  maxWords: 225,
  timeLimitSeconds: 20 * 60,
};

export const writingContent = {
  totalTimeSeconds: 25 * 60,
  tasks: [task1, task2] as [WritingTask, WritingTask],
};
