import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { AttemptScores } from "@/lib/types/attempt";

const SECTION_LABELS: { key: keyof Omit<AttemptScores, "overall" | "overallBand">; label: string }[] = [
  { key: "grammar", label: "Grammar" },
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
];

export function SectionBreakdownTable({ scores, ungradedSections = [] }: { scores: AttemptScores; ungradedSections?: string[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sección</TableHead>
          <TableHead>Puntaje</TableHead>
          <TableHead className="w-[40%]">Progreso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SECTION_LABELS.map(({ key, label }) => (
          <TableRow key={key}>
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell>
              {ungradedSections.includes(key) ? "No disponible" : <span className="tabular-nums">{scores[key].toFixed(1)}</span>}
            </TableCell>
            <TableCell>{ungradedSections.includes(key) ? null : <Progress value={(scores[key] / 6) * 100} />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
