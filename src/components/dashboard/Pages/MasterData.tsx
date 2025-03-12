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
import { useToast } from "@/components/ui/use-toast";

// Import the table components
import { KPITable } from "../../dashboard/tables/KPITable";
import { RequirementTable } from "../../dashboard/tables/RequirementTable";
import { CodeOfHonorTable } from "../../dashboard/tables/CodeOfHonorTable";
import { RankTable } from "../../dashboard/tables/RankTable";
import { RankPromotionTable } from "../../dashboard/tables/RankPromotionTable";
import { AddItemModal, TableType } from "../../dashboard/modals/AddItemModal";

// Import services
import { kpiService } from "../../../services/kpiService";
import { requirementService } from "../../../services/requirementService";
import { codeOfHonorService } from "../../../services/codeOfHonorService";
import { rankService } from "../../../services/rankService";
import { rankPromotionService } from "../../../services/rankPromotionService";

export function MasterData() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TableType>("kpi");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reference to the table components for refreshing
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setIsLoading(true);
    // Trigger a refresh by incrementing the refreshTrigger
    setRefreshTrigger(prev => prev + 1);
    // Simulate data fetching delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Handle different table types
      switch (activeTab) {
        case 'kpi':
          await kpiService.createKPI({
            kpi_name: data.kpi_name,
            kpi_type: data.kpi_type
          });
          toast({
            title: 'Success',
            description: `KPI "${data.kpi_name}" has been created.`,
          });
          break;
          
        case 'requirement':
          await requirementService.createRequirement({
            requirement_name: data.requirement_name
          });
          toast({
            title: 'Success',
            description: `Requirement "${data.requirement_name}" has been created.`,
          });
          break;
          
        case 'code-of-honor':
          await codeOfHonorService.createCodeOfHonor({
            code_of_honor_name: data.code_of_honor_name,
            explanation: data.explanation
          });
          toast({
            title: 'Success',
            description: `Code of Honor "${data.code_of_honor_name}" has been created.`,
          });
          break;
          
        case 'rank':
          await rankService.createRank({
            rank_name: data.rank_name,
            rank_level: data.rank_level,
            manual_promotion: data.manual_promotion,
            time_requirement_months: data.time_requirement_months
          });
          toast({
            title: 'Success',
            description: `Rank "${data.rank_name}" has been created.`,
          });
          break;
          
        case 'rank-promotion':
          await rankPromotionService.createRankPromotion({
            rank_id: data.rank_id,
            kpi_id: data.kpi_id,
            requirement_id: data.requirement_id,
            target_count_house: data.target_count_house,
            target_count_condo: data.target_count_condo,
            minimum_skillset_score: data.minimum_skillset_score,
            timeframe_days: data.timeframe_days
          });
          toast({
            title: 'Success',
            description: `Rank Promotion Condition has been created.`,
          });
          break;
          
        default:
          toast({
            title: 'Error',
            description: 'Unknown table type.',
            variant: 'destructive',
          });
      }
      
      // Close the modal and refresh the data
      setIsModalOpen(false);
      handleRefresh();
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <Button onClick={handleAddNew}>
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

      <Tabs defaultValue="kpi" className="w-full" onValueChange={(value) => setActiveTab(value as TableType)}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-max w-full">
            <TabsTrigger value="kpi">KPI</TabsTrigger>
            <TabsTrigger value="requirement">Requirement</TabsTrigger>
            <TabsTrigger value="code-of-honor">Code of Honor</TabsTrigger>
            <TabsTrigger value="rank">Rank</TabsTrigger>
            <TabsTrigger value="rank-promotion">Rank Promotion</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="kpi" className="mt-6">
          <KPITable isLoading={isLoading} key={`kpi-${refreshTrigger}`} />
        </TabsContent>
        
        <TabsContent value="requirement" className="mt-6">
          <RequirementTable isLoading={isLoading} key={`requirement-${refreshTrigger}`} />
        </TabsContent>
        
        <TabsContent value="code-of-honor" className="mt-6">
          <CodeOfHonorTable isLoading={isLoading} key={`code-of-honor-${refreshTrigger}`} />
        </TabsContent>
        
        <TabsContent value="rank" className="mt-6">
          <RankTable isLoading={isLoading} key={`rank-${refreshTrigger}`} />
        </TabsContent>
        
        <TabsContent value="rank-promotion" className="mt-6">
          <RankPromotionTable isLoading={isLoading} key={`rank-promotion-${refreshTrigger}`} />
        </TabsContent>
      </Tabs>

      <AddItemModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tableType={activeTab}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
