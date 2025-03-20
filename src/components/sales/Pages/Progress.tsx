import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { weeklyDataService } from "@/services/api/weeklyDataService";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";

interface ProbationProgress {
  sales_id: number;
  starting_date: string;
  current_week: number | null;
  probation_progress: number;
  weeks_total: number;
  weeks_completed: number;
  weeks_successful: number;
  on_track_to_pass: boolean;
  weekly_details: {
    week_id: number;
    week_number: number;
    month_number: number;
    overall_progress: number;
    pass_criteria_met: boolean;
  }[];
}

export function SalesProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [probationProgress, setProbationProgress] = useState<ProbationProgress | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProbationProgress = async () => {
      if (!user || !user.salesId) return;
      
      try {
        const progress = await weeklyDataService.getProbationProgress(user.salesId);
        setProbationProgress(progress);
      } catch (error) {
        console.error("Failed to fetch probation progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProbationProgress();
  }, [user]);

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

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ) : probationProgress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Probation Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm font-medium">{probationProgress.probation_progress}%</span>
                    </div>
                    <Progress value={probationProgress.probation_progress} className="h-2" />
                  </div>
                  
                  <div>
                    <Badge 
                      variant={probationProgress.on_track_to_pass ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {probationProgress.on_track_to_pass ? "On Track" : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Week</dt>
                      <dd className="text-2xl font-bold">{probationProgress.current_week || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Total Weeks</dt>
                      <dd className="text-2xl font-bold">{probationProgress.weeks_total}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Completed Weeks</dt>
                      <dd className="text-2xl font-bold">{probationProgress.weeks_completed}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Successful Weeks</dt>
                      <dd className="text-2xl font-bold">{probationProgress.weeks_successful}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">No progress data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : probationProgress && probationProgress.weekly_details.length > 0 ? (
            <div className="space-y-4">
              {probationProgress.weekly_details
                .sort((a, b) => a.week_number - b.week_number)
                .map((week) => (
                  <Card key={week.week_id} className="overflow-hidden">
                    <div className={`p-4 flex items-center justify-between ${
                      week.pass_criteria_met 
                        ? "bg-green-50 dark:bg-green-950" 
                        : week.overall_progress > 0 
                          ? "bg-amber-50 dark:bg-amber-950" 
                          : "bg-gray-50 dark:bg-gray-900"
                    }`}>
                      <div>
                        <h3 className="font-medium">Week {week.week_number}</h3>
                        <p className="text-sm text-muted-foreground">Month {week.month_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{week.overall_progress}%</div>
                        {week.pass_criteria_met ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : week.overall_progress > 0 ? (
                          <Clock className="h-5 w-5 text-amber-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <Progress 
                        value={week.overall_progress} 
                        className={`h-2 ${
                          week.pass_criteria_met 
                            ? "bg-green-100 dark:bg-green-900" 
                            : "bg-gray-100 dark:bg-gray-800"
                        }`} 
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">No weekly progress data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
