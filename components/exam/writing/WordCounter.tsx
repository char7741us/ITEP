import { cn } from "@/lib/utils";

export function WordCounter({ text, minWords, maxWords }: { text: string; minWords: number; maxWords: number }) {
  const trimmed = text.trim();
  const count = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const inRange = count >= minWords && count <= maxWords;

  return (
    <p className={cn("text-xs", inRange ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
      {count} palabras · objetivo: {minWords}-{maxWords}
    </p>
  );
}
