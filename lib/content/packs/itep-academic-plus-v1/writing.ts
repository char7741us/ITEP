import type { WritingTask } from "@/lib/types/content";

const task1: WritingTask = {
  taskNumber: 1,
  title: "Short Message",
  prompt:
    "Write a short email to your professor explaining that you will be unable to attend tomorrow's class and asking how you can get the notes you will miss.",
  minWords: 50,
  maxWords: 75,
  timeLimitSeconds: 5 * 60,
};

const task2: WritingTask = {
  taskNumber: 2,
  title: "Opinion Essay",
  prompt:
    "Some people believe that universities should require all students to take at least one course outside their main field of study. Others believe students should be allowed to focus entirely on their chosen major. Discuss both views and give your own opinion.",
  minWords: 175,
  maxWords: 225,
  timeLimitSeconds: 20 * 60,
};

export const writingContent = {
  totalTimeSeconds: 25 * 60,
  tasks: [task1, task2] as [WritingTask, WritingTask],
};
