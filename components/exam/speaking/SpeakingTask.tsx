import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecorderControls } from "./RecorderControls";
import { Clock, Mic } from "lucide-react";

interface SpeakingTaskProps {
  title: string;
  prompt: string;
  taskNumber: 1 | 2;
  responseSeconds: number;
  onRecorded: (blob: Blob) => void;
}

export function SpeakingTask({ title, prompt, taskNumber, responseSeconds, onRecorded }: SpeakingTaskProps) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Mic className="h-3 w-3" />
                Tarea {taskNumber}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {responseSeconds}s
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{prompt}</p>
        </CardContent>
      </Card>
      <RecorderControls onRecorded={onRecorded} />
    </div>
  );
}
