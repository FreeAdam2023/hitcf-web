import { Card, CardContent } from "@/components/ui/card";

interface ScoreCardProps {
  score: number;
  total: number;
}

export function ScoreCard({ score, total }: ScoreCardProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-8">
        <div className="text-5xl font-bold">
          {score}
          <span className="text-2xl text-muted-foreground">/{total}</span>
        </div>
        <div className="mt-2 text-lg text-muted-foreground">
          正确率 {pct}%
        </div>
      </CardContent>
    </Card>
  );
}
