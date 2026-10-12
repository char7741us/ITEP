import type { AttemptRecord } from "@/lib/types/attempt";
import type { SkillSection } from "@/lib/types/content";

export function hasCompleteSkillGrade(attempt: AttemptRecord, skill: SkillSection): boolean {
  if (!attempt.scores || attempt.status !== "completed") return false;
  if (skill !== "writing" && skill !== "speaking") return true;
  const responses = attempt.responses[skill];
  return ([1, 2] as const).every((taskNumber) => !!responses.find((item) => item.taskNumber === taskNumber)?.grading);
}
export function isPartialAttempt(attempt: AttemptRecord): boolean {
  return !!attempt.gradingErrors?.length || !hasCompleteSkillGrade(attempt, "writing") || !hasCompleteSkillGrade(attempt, "speaking");
}
