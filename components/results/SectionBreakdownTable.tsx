import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AttemptScores } from "@/lib/types/attempt";

const SECTION_LABELS: { key: keyof Omit<AttemptScores, "overall" | "overallBand">; label: string; implemented: boolean }[] = [
  { key: "reading", label: "Reading", implemented: true },
  { key: "listening", label: "Listening", implemented: true },
  { key: "grammar", label: "Grammar", implemented: true },
  { key: "writing", label: "Writing", implemented: true },
  { key: "speaking", label: "Speaking", implemented: true },
];

export function SectionBreakdownTable({ scores }: { scores: AttemptScores }) {
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
        {SECTION_LABELS.map(({ key, label, implemented }) => (
          <TableRow key={key}>
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell>
              {implemented ? (
                <span className="tabular-nums">{scores[key].toFixed(1)}</span>
              ) : (
                <Badge variant="secondary">Próximamente</Badge>
              )}
            </TableCell>
            <TableCell>{implemented ? <Progress value={(scores[key] / 6) * 100} /> : null}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
