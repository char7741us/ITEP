import { notFound } from "next/navigation";
import { c1Modules, getLabModule } from "@/lib/content/c1-lab/bank";
import { C1ModulePractice } from "@/components/learning/C1Lab";
export function generateStaticParams() { return c1Modules.map((module) => ({ id: module.id })); }
export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workshop = getLabModule(id);
  if (!workshop) notFound();
  return <C1ModulePractice module={workshop} />;
}
