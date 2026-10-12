import { notFound } from "next/navigation";
import { productiveTasks } from "@/lib/content/c1-lab/bank";
import { ProductiveTrainer } from "@/components/learning/ProductiveTrainer";
export function generateStaticParams() { return productiveTasks.map((task) => ({ id: task.id })); }
export default async function ProductivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = productiveTasks.find((item) => item.id === id);
  if (!task) notFound();
  return <ProductiveTrainer task={task} />;
}
