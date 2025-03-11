
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Users, Target } from "lucide-react";

export function SalesProgress() {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$24,563",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "New Leads",
      value: "45",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Conversion Rate",
      value: "18.2%",
      change: "-2.4%",
      trend: "down",
      icon: Target,
      color: "text-red-500",
    }
  ];

  const targets = [
    { name: "Quarterly Goal", progress: 78 },
    { name: "Annual Target", progress: 45 },
    { name: "Client Acquisition", progress: 62 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your performance metrics</p>
        </div>
        <Button className="self-start">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-1">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground text-xs ml-2">vs. last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Progress</CardTitle>
          <CardDescription>Track your progress toward key objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {targets.map((target, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{target.name}</span>
                <span className="text-muted-foreground">{target.progress}%</span>
              </div>
              <Progress value={target.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
