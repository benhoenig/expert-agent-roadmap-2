import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Plus, RefreshCw, Loader2 } from "lucide-react";

// Import the table components
import { ActionKPITable } from "../../dashboard/tables/ActionKPITable";
import { SkillsetKPITable } from "../../dashboard/tables/SkillsetKPITable";
import { RequirementTable } from "../../dashboard/tables/RequirementTable";
import { CodeOfHonorTable } from "../../dashboard/tables/CodeOfHonorTable";
import { RankTable } from "../../dashboard/tables/RankTable";
import { RankPromotionTable } from "../../dashboard/tables/RankPromotionTable";

export function MasterData() {
  const [activeTab, setActiveTab] = useState("action-kpi");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data fetching
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader 
          title="Master Data" 
          description="Manage master data tables and configurations"
          actions={
            <div className="flex gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          }
        />
      </motion.div>

      <Tabs defaultValue="action-kpi" className="w-full" onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-max w-full">
            <TabsTrigger value="action-kpi">Action KPI</TabsTrigger>
            <TabsTrigger value="skillset-kpi">Skillset KPI</TabsTrigger>
            <TabsTrigger value="requirement">Requirement</TabsTrigger>
            <TabsTrigger value="code-of-honor">Code of Honor</TabsTrigger>
            <TabsTrigger value="rank">Rank</TabsTrigger>
            <TabsTrigger value="rank-promotion">Rank Promotion</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="action-kpi" className="mt-6">
          <ActionKPITable isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="skillset-kpi" className="mt-6">
          <SkillsetKPITable isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="requirement" className="mt-6">
          <RequirementTable isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="code-of-honor" className="mt-6">
          <CodeOfHonorTable isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="rank" className="mt-6">
          <RankTable isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="rank-promotion" className="mt-6">
          <RankPromotionTable isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
