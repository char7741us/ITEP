import { Badge } from "@/components/ui/badge";
import type { CEFRBand } from "@/lib/types/attempt";
import { cn } from "@/lib/utils";

const BAND_STYLES: Record<CEFRBand, string> = {
  "Below B2": "bg-muted text-muted-foreground",
  B2: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  C1: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  C2: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export function CEFRBandBadge({ band, className }: { band: CEFRBand; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-semibold", BAND_STYLES[band], className)}>
      {band}
    </Badge>
  );
}
