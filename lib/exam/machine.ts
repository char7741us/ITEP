import { setup, assign, fromPromise } from "xstate";
import type { ExamMachineContext, ExamMachineEvent, ExamMachineInput } from "./machine.types";
import { loadContentPack } from "@/lib/content/loader";
import { getReadingItems, getGrammarItems } from "./items";
import { getListeningItems, getListeningSegments } from "./listening";
import { averageScore, scoreObjectiveSection } from "./scoring";
import { scoreToBand } from "./cefr";
import { gradeFullAttempt } from "./grading";

export const examMachine = setup({
  types: {} as {
    context: ExamMachineContext;
    events: ExamMachineEvent;
    input: ExamMachineInput;
  },
  actors: {
    gradeAttempt: fromPromise(({ input }: { input: ExamMachineContext }) => gradeFullAttempt(input)),
  },
  guards: {
    readingTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.reading.endsAt === null) return false;
      return event.now >= context.reading.endsAt;
    },
    listeningTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.listening.endsAt === null) return false;
      return event.now >= context.listening.endsAt;
    },
    grammarTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.grammar.endsAt === null) return false;
      return event.now >= context.grammar.endsAt;
    },
    writingTask1TimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.writing.endsAtByTask[1] === null) return false;
      return event.now >= context.writing.endsAtByTask[1];
    },
    writingTask2TimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.writing.endsAtByTask[2] === null) return false;
      return event.now >= context.writing.endsAtByTask[2];
    },
    warmupTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.speaking.warmupEndsAt === null) return false;
      return event.now >= context.speaking.warmupEndsAt;
    },
    task1PrepTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.speaking.prepEndsAtByTask[1] === null) return false;
      return event.now >= context.speaking.prepEndsAtByTask[1];
    },
    task1RecordTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.speaking.recordEndsAtByTask[1] === null) return false;
      return event.now >= context.speaking.recordEndsAtByTask[1];
    },
    task2PrepTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.speaking.prepEndsAtByTask[2] === null) return false;
      return event.now >= context.speaking.prepEndsAtByTask[2];
    },
    task2RecordTimeIsUp: ({ context, event }) => {
      if (event.type !== "TICK" || context.speaking.recordEndsAtByTask[2] === null) return false;
      return event.now >= context.speaking.recordEndsAtByTask[2];
    },
  },
  actions: {
    recordReadingAnswer: assign({
      reading: ({ context, event }) => {
        if (event.type !== "ANSWER_READING") return context.reading;
        return {
          ...context.reading,
          responses: {
            ...context.reading.responses,
            [event.itemId]: {
              itemId: event.itemId,
              selectedIndex: event.selectedIndex,
              timeSpentMs: event.timeSpentMs,
            },
          },
        };
      },
    }),
    advanceReadingPart: assign({
      reading: ({ context }) => ({ ...context.reading, partIndex: 1 as const }),
    }),
    markReadingAutoSubmitted: assign({
      reading: ({ context }) => ({ ...context.reading, autoSubmitted: true }),
    }),
    startListeningTimer: assign({
      listening: ({ context }) => ({
        ...context.listening,
        endsAt: Date.now() + loadContentPack(context.contentPackKey).listening.totalTimeSeconds * 1000,
      }),
    }),
    markSegmentPlayed: assign({
      listening: ({ context, event }) => {
        if (event.type !== "MARK_SEGMENT_PLAYED") return context.listening;
        if (context.listening.playedSegmentIndices.includes(event.index)) return context.listening;
        return {
          ...context.listening,
          playedSegmentIndices: [...context.listening.playedSegmentIndices, event.index],
        };
      },
    }),
    recordListeningAnswer: assign({
      listening: ({ context, event }) => {
        if (event.type !== "ANSWER_LISTENING") return context.listening;
        return {
          ...context.listening,
          responses: {
            ...context.listening.responses,
            [event.itemId]: {
              itemId: event.itemId,
              selectedIndex: event.selectedIndex,
              timeSpentMs: event.timeSpentMs,
            },
          },
        };
      },
    }),
    advanceListeningSegment: assign({
      listening: ({ context }) => ({
        ...context.listening,
        currentSegmentIndex: context.listening.currentSegmentIndex + 1,
      }),
    }),
    markListeningAutoSubmitted: assign({
      listening: ({ context }) => ({ ...context.listening, autoSubmitted: true }),
    }),
    startGrammarTimer: assign({
      grammar: ({ context }) => ({
        ...context.grammar,
        endsAt: Date.now() + loadContentPack(context.contentPackKey).grammar.totalTimeSeconds * 1000,
      }),
    }),
    recordGrammarAnswer: assign({
      grammar: ({ context, event }) => {
        if (event.type !== "ANSWER_GRAMMAR") return context.grammar;
        return {
          ...context.grammar,
          responses: {
            ...context.grammar.responses,
            [event.itemId]: {
              itemId: event.itemId,
              selectedIndex: event.selectedIndex,
              timeSpentMs: event.timeSpentMs,
            },
          },
        };
      },
    }),
    goToGrammarItem: assign({
      grammar: ({ context, event }) => {
        if (event.type !== "GO_TO_GRAMMAR_ITEM") return context.grammar;
        return { ...context.grammar, currentIndex: event.index };
      },
    }),
    markGrammarAutoSubmitted: assign({
      grammar: ({ context }) => ({ ...context.grammar, autoSubmitted: true }),
    }),
    startWritingTask1Timer: assign({
      writing: ({ context }) => ({
        ...context.writing,
        endsAtByTask: {
          ...context.writing.endsAtByTask,
          1: Date.now() + loadContentPack(context.contentPackKey).writing.tasks[0].timeLimitSeconds * 1000,
        },
      }),
    }),
    startWritingTask2Timer: assign({
      writing: ({ context }) => ({
        ...context.writing,
        endsAtByTask: {
          ...context.writing.endsAtByTask,
          2: Date.now() + loadContentPack(context.contentPackKey).writing.tasks[1].timeLimitSeconds * 1000,
        },
      }),
    }),
    updateWritingText: assign({
      writing: ({ context, event }) => {
        if (event.type !== "UPDATE_WRITING_TEXT") return context.writing;
        return { ...context.writing, texts: { ...context.writing.texts, [event.taskNumber]: event.text } };
      },
    }),
    markWritingTask1AutoSubmitted: assign({
      writing: ({ context }) => ({
        ...context.writing,
        autoSubmittedByTask: { ...context.writing.autoSubmittedByTask, 1: true },
      }),
    }),
    markWritingTask2AutoSubmitted: assign({
      writing: ({ context }) => ({
        ...context.writing,
        autoSubmittedByTask: { ...context.writing.autoSubmittedByTask, 2: true },
      }),
    }),
    startWarmupTimer: assign({
      speaking: ({ context }) => ({
        ...context.speaking,
        warmupEndsAt: Date.now() + loadContentPack(context.contentPackKey).speaking.warmupSeconds * 1000,
      }),
    }),
    startTask1PrepTimer: assign({
      speaking: ({ context }) => ({
        ...context.speaking,
        prepEndsAtByTask: {
          ...context.speaking.prepEndsAtByTask,
          1: Date.now() + loadContentPack(context.contentPackKey).speaking.tasks[0].prepSeconds * 1000,
        },
      }),
    }),
    startTask1RecordTimer: assign({
      speaking: ({ context }) => ({
        ...context.speaking,
        recordEndsAtByTask: {
          ...context.speaking.recordEndsAtByTask,
          1: Date.now() + loadContentPack(context.contentPackKey).speaking.tasks[0].responseSeconds * 1000,
        },
      }),
    }),
    startTask2PrepTimer: assign({
      speaking: ({ context }) => ({
        ...context.speaking,
        prepEndsAtByTask: {
          ...context.speaking.prepEndsAtByTask,
          2: Date.now() + loadContentPack(context.contentPackKey).speaking.tasks[1].prepSeconds * 1000,
        },
      }),
    }),
    startTask2RecordTimer: assign({
      speaking: ({ context }) => ({
        ...context.speaking,
        recordEndsAtByTask: {
          ...context.speaking.recordEndsAtByTask,
          2: Date.now() + loadContentPack(context.contentPackKey).speaking.tasks[1].responseSeconds * 1000,
        },
      }),
    }),
    saveSpeakingRecording: assign({
      speaking: ({ context, event }) => {
        if (event.type !== "SAVE_SPEAKING_RECORDING") return context.speaking;
        return {
          ...context.speaking,
          audioBlobKeyByTask: { ...context.speaking.audioBlobKeyByTask, [event.taskNumber]: event.blobKey },
        };
      },
    }),
  },
}).createMachine({
  id: "exam",
  context: ({ input }) => ({
    attemptId: input.attemptId,
    mode: input.mode,
    contentPackKey: input.contentPackKey,
    reading: { partIndex: 0, responses: {}, endsAt: null, autoSubmitted: false },
    listening: { currentSegmentIndex: 0, responses: {}, playedSegmentIndices: [], endsAt: null, autoSubmitted: false },
    grammar: { currentIndex: 0, responses: {}, endsAt: null, autoSubmitted: false },
    writing: {
      texts: { 1: "", 2: "" },
      endsAtByTask: { 1: null, 2: null },
      autoSubmittedByTask: { 1: false, 2: false },
    },
    speaking: {
      warmupEndsAt: null,
      prepEndsAtByTask: { 1: null, 2: null },
      recordEndsAtByTask: { 1: null, 2: null },
      audioBlobKeyByTask: {},
    },
    scores: null,
    writingGrades: {},
    speakingGrades: {},
    gradingErrors: [],
  }),
  initial: "setup",
  states: {
    setup: {
      on: {
        START: {
          target: "reading",
          actions: assign({
            reading: ({ context }) => ({
              ...context.reading,
              endsAt: Date.now() + loadContentPack(context.contentPackKey).reading.totalTimeSeconds * 1000,
            }),
          }),
        },
      },
    },
    reading: {
      initial: "part1",
      states: {
        part1: {
          on: {
            ANSWER_READING: { actions: "recordReadingAnswer" },
            NEXT_READING_PART: { target: "part2", actions: "advanceReadingPart" },
            TICK: { guard: "readingTimeIsUp", target: "#exam.listening", actions: "markReadingAutoSubmitted" },
          },
        },
        part2: {
          on: {
            ANSWER_READING: { actions: "recordReadingAnswer" },
            SUBMIT_READING: "#exam.listening",
            TICK: { guard: "readingTimeIsUp", target: "#exam.listening", actions: "markReadingAutoSubmitted" },
          },
        },
      },
    },
    listening: {
      entry: "startListeningTimer",
      on: {
        MARK_SEGMENT_PLAYED: { actions: "markSegmentPlayed" },
        ANSWER_LISTENING: { actions: "recordListeningAnswer" },
        NEXT_LISTENING_SEGMENT: { actions: "advanceListeningSegment" },
        SUBMIT_LISTENING: "grammar",
        TICK: { guard: "listeningTimeIsUp", target: "grammar", actions: "markListeningAutoSubmitted" },
      },
    },
    grammar: {
      entry: "startGrammarTimer",
      on: {
        ANSWER_GRAMMAR: { actions: "recordGrammarAnswer" },
        GO_TO_GRAMMAR_ITEM: { actions: "goToGrammarItem" },
        SUBMIT_GRAMMAR: "writing",
        TICK: { guard: "grammarTimeIsUp", target: "writing", actions: "markGrammarAutoSubmitted" },
      },
    },
    writing: {
      initial: "task1",
      states: {
        task1: {
          entry: "startWritingTask1Timer",
          on: {
            UPDATE_WRITING_TEXT: { actions: "updateWritingText" },
            SUBMIT_WRITING_TASK: "task2",
            TICK: { guard: "writingTask1TimeIsUp", target: "task2", actions: "markWritingTask1AutoSubmitted" },
          },
        },
        task2: {
          entry: "startWritingTask2Timer",
          on: {
            UPDATE_WRITING_TEXT: { actions: "updateWritingText" },
            SUBMIT_WRITING_TASK: "#exam.speaking",
            TICK: { guard: "writingTask2TimeIsUp", target: "#exam.speaking", actions: "markWritingTask2AutoSubmitted" },
          },
        },
      },
    },
    speaking: {
      initial: "warmup",
      states: {
        warmup: {
          entry: "startWarmupTimer",
          on: { TICK: { guard: "warmupTimeIsUp", target: "task1Prep" } },
        },
        task1Prep: {
          entry: "startTask1PrepTimer",
          on: { TICK: { guard: "task1PrepTimeIsUp", target: "task1Record" } },
        },
        task1Record: {
          entry: "startTask1RecordTimer",
          on: {
            SAVE_SPEAKING_RECORDING: { actions: "saveSpeakingRecording" },
            TICK: { guard: "task1RecordTimeIsUp", target: "task2Prep" },
          },
        },
        task2Prep: {
          entry: "startTask2PrepTimer",
          on: { TICK: { guard: "task2PrepTimeIsUp", target: "task2Record" } },
        },
        task2Record: {
          entry: "startTask2RecordTimer",
          on: {
            SAVE_SPEAKING_RECORDING: { actions: "saveSpeakingRecording" },
            TICK: { guard: "task2RecordTimeIsUp", target: "#exam.grading" },
          },
        },
      },
    },
    grading: {
      invoke: {
        src: "gradeAttempt",
        input: ({ context }) => context,
        onDone: {
          target: "done",
          actions: assign({
            scores: ({ event }) => event.output.scores,
            writingGrades: ({ event }) => event.output.writingGrades,
            speakingGrades: ({ event }) => event.output.speakingGrades,
            gradingErrors: ({ event }) => event.output.gradingErrors,
          }),
        },
        onError: {
          target: "done",
          actions: assign({
            scores: ({ context }) => {
              const readingScore = scoreObjectiveSection(getReadingItems(context.contentPackKey), Object.values(context.reading.responses));
              const listeningScore = scoreObjectiveSection(
                getListeningItems(loadContentPack(context.contentPackKey)),
                Object.values(context.listening.responses)
              );
              const grammarScore = scoreObjectiveSection(getGrammarItems(context.contentPackKey), Object.values(context.grammar.responses));
              const overall = averageScore([readingScore, listeningScore, grammarScore, 0, 0]);
              return {
                reading: readingScore,
                listening: listeningScore,
                grammar: grammarScore,
                writing: 0,
                speaking: 0,
                overall,
                overallBand: scoreToBand(overall).band,
              };
            },
            gradingErrors: ({ event }) => [event.error instanceof Error ? event.error.message : String(event.error)],
          }),
        },
      },
    },
    done: { type: "final" },
  },
});

export { getReadingItems, getGrammarItems, getListeningItems, getListeningSegments };
