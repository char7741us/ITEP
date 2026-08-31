import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, BookOpen } from "lucide-react";

interface PrepCountdownProps {
  title: string;
  prompt: string;
  taskNumber: 1 | 2;
  prepSeconds: number;
}

export function PrepCountdown({ title, prompt, taskNumber, prepSeconds }: PrepCountdownProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="h-3 w-3" />
              Tarea {taskNumber}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {prepSeconds}s para preparar
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{prompt}</p>

        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">Consejos para esta tarea:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Organiza tu respuesta antes de empezar a hablar</li>
                <li>• Usa conectores para estructurar tus ideas</li>
                <li>• Sé específico con ejemplos y detalles</li>
                <li>• Practica en voz alta para ganar confianza</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
