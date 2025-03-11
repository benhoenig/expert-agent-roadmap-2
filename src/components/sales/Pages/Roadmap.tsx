
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Target } from "lucide-react";

export function SalesRoadmap() {
  const stages = [
    {
      id: 1,
      title: "Discovery",
      description: "Initial client outreach and need analysis",
      icon: MapPin,
      color: "bg-blue-100 text-blue-700",
      tasks: 4,
      completed: 2,
    },
    {
      id: 2,
      title: "Proposal",
      description: "Solution presentation and value demonstration",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      tasks: 3,
      completed: 1,
    },
    {
      id: 3,
      title: "Negotiation",
      description: "Terms finalization and contract preparation",
      icon: Calendar,
      color: "bg-amber-100 text-amber-700",
      tasks: 5,
      completed: 0,
    },
    {
      id: 4,
      title: "Closing",
      description: "Deal finalization and handoff to implementation",
      icon: Target,
      color: "bg-green-100 text-green-700",
      tasks: 3,
      completed: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales Roadmap</h2>
          <p className="text-muted-foreground">Strategic plan for your sales journey</p>
        </div>
        <Button className="self-start">
          <MapPin className="mr-2 h-4 w-4" />
          Create New Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-md ${stage.color}`}>
                    <stage.icon size={16} />
                  </div>
                  <div className="text-xs font-medium rounded-full px-2 py-1 bg-muted">
                    Stage {stage.id}
                  </div>
                </div>
                <CardTitle className="mt-2">{stage.title}</CardTitle>
                <CardDescription>{stage.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round((stage.completed / stage.tasks) * 100) || 0}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-gold-500 rounded-full"
                    style={{ width: `${(stage.completed / stage.tasks) * 100}%` }}
                  />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {stage.completed} of {stage.tasks} tasks completed
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
