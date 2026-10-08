import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CEFRBandBadge } from "@/components/results/CEFRBandBadge";
import { EXAM_MODE_LABELS } from "@/lib/types/mode";
import type { AttemptRecord } from "@/lib/types/attempt";

export function AttemptHistoryTable({ attempts }: { attempts: AttemptRecord[] }) {
  const visible = attempts.filter((a) => a.status === "in_progress" || (a.status === "completed" && a.scores));

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no has comenzado ningún simulacro.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Modo</TableHead>
          <TableHead>Puntaje</TableHead>
          <TableHead>Banda</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {visible.map((attempt) => (
          <TableRow key={attempt.id}>
            <TableCell>{new Date(attempt.startedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
            <TableCell>{EXAM_MODE_LABELS[attempt.mode]}</TableCell>
            <TableCell className="tabular-nums">{attempt.scores ? `${attempt.scores.overall.toFixed(1)}${attempt.gradingErrors?.length ? " (parcial)" : ""}` : "En curso"}</TableCell>
            <TableCell>
              {attempt.scores ? <CEFRBandBadge band={attempt.scores.overallBand} /> : "—"}
            </TableCell>
            <TableCell>
              <Link href={attempt.status === "in_progress" ? `/exam/run/${attempt.id}` : `/results/${attempt.id}`} className="text-sm font-medium text-primary hover:underline">
                {attempt.status === "in_progress" ? "Continuar" : "Ver detalle"}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
