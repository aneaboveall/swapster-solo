
import { Progress } from "@/components/ui/progress";

export function SwapProgress({
  current,
  total,
  status,
}: {
  current: number;
  total: number;
  status: string;
}) {
  const progress = total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Progress: {current} / {total}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-center text-muted-foreground">{status}</p>
    </div>
  );
}
