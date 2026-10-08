import { notFound } from "next/navigation";
import { dailySessions, getDailySession } from "@/lib/content/daily/build";
import { DailySessionPractice } from "@/components/daily/DailySessionPractice";

export function generateStaticParams() {
  return dailySessions.map((session) => ({ day: String(session.day) }));
}

export default async function DailySessionPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: rawDay } = await params;
  const day = Number(rawDay);
  const session = getDailySession(day);
  if (!session || String(day) !== rawDay) notFound();
  return <DailySessionPractice session={session} />;
}
