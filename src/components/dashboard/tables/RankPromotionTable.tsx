import { useState, useEffect } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';
import { 
  rankPromotionService, 
  RankPromotion as RankPromotionType 
} from '../../../services/rankPromotionService';
import { rankService, Rank } from '../../../services/rankService';
import { kpiService, KPI } from '../../../services/kpiService';
import { requirementService, Requirement } from '../../../services/requirementService';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

interface RankPromotionTableProps {
  isLoading: boolean;
}

// Rank Promotion form schema
const rankPromotionSchema = z.object({
  rank_id: z.coerce.number().min(1, "Rank is required"),
  kpi_id: z.coerce.number().min(1, "KPI is required"),
  requirement_id: z.coerce.number().min(1, "Requirement is required"),
  target_count_house: z.coerce.number().min(0, "Target count for houses must be at least 0"),
  target_count_condo: z.coerce.number().min(0, "Target count for condos must be at least 0"),
  minimum_skillset_score: z.coerce.number().min(0, "Minimum skillset score must be at least 0"),
  timeframe_days: z.coerce.number().min(1, "Timeframe must be at least 1 day"),
});

type RankPromotionFormValues = z.infer<typeof rankPromotionSchema>;

export function RankPromotionTable({ isLoading: externalLoading }: RankPromotionTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RankPromotionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RankPromotionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for dropdown options
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Create the form
  const form = useForm<RankPromotionFormValues>({
    resolver: zodResolver(rankPromotionSchema),
    defaultValues: {
      rank_id: 0,
      kpi_id: 0,
      requirement_id: 0,
      target_count_house: 0,
      target_count_condo: 0,
      minimum_skillset_score: 0,
      timeframe_days: 30,
    },
  });

  // Update form values when selected item changes
  useEffect(() => {
    if (selectedItem) {
      form.setValue("rank_id", selectedItem.rank_id);
      form.setValue("kpi_id", selectedItem.kpi_id);
      form.setValue("requirement_id", selectedItem.requirement_id);
      form.setValue("target_count_house", selectedItem.target_count_house);
      form.setValue("target_count_condo", selectedItem.target_count_condo);
      form.setValue("minimum_skillset_score", selectedItem.minimum_skillset_score);
      form.setValue("timeframe_days", selectedItem.timeframe_days);
    }
  }, [selectedItem, form]);

  // Fetch rank promotions and dropdown options on component mount
  useEffect(() => {
    fetchRankPromotions();
    fetchDropdownOptions();
  }, []);

  // Fetch rank promotions from the API
  const fetchRankPromotions = async () => {
    setIsLoading(true);
    try {
      const promotions = await rankPromotionService.getAllRankPromotions();
      setItems(promotions);
    } catch (error: any) {
      console.error('Error fetching rank promotions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch rank promotions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dropdown options from the API
  const fetchDropdownOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [ranksData, kpisData, requirementsData] = await Promise.all([
        rankService.getAllRanks(),
        kpiService.getAllKPIs(),
        requirementService.getAllRequirements()
      ]);
      
      setRanks(ranksData);
      setKpis(kpisData);
      setRequirements(requirementsData);
    } catch (error: any) {
      console.error('Error fetching dropdown options:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch dropdown options',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Helper functions to get names from IDs
  const getRankName = (rankId: number) => {
    const rank = ranks.find(r => r.id === rankId);
    return rank ? rank.rank_name : `Rank ID: ${rankId}`;
  };

  const getKpiName = (kpiId: number) => {
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi ? kpi.kpi_name : `KPI ID: ${kpiId}`;
  };

  const getRequirementName = (requirementId: number) => {
    const requirement = requirements.find(r => r.id === requirementId);
    return requirement ? requirement.requirement_name : `Requirement ID: ${requirementId}`;
  };

  const columns = [
    { 
      header: 'Rank', 
      accessor: 'rank_id' as keyof RankPromotionType,
      cell: (item: RankPromotionType) => (
        <span>{getRankName(item.rank_id)}</span>
      )
    },
    { 
      header: 'KPI', 
      accessor: 'kpi_id' as keyof RankPromotionType,
      cell: (item: RankPromotionType) => (
        <span>{getKpiName(item.kpi_id)}</span>
      )
    },
    { 
      header: 'Requirement', 
      accessor: 'requirement_id' as keyof RankPromotionType,
      cell: (item: RankPromotionType) => (
        <span>{getRequirementName(item.requirement_id)}</span>
      )
    },
    { header: 'Target (House)', accessor: 'target_count_house' as keyof RankPromotionType },
    { header: 'Target (Condo)', accessor: 'target_count_condo' as keyof RankPromotionType },
    { header: 'Min. Skillset Score', accessor: 'minimum_skillset_score' as keyof RankPromotionType },
    { header: 'Timeframe (Days)', accessor: 'timeframe_days' as keyof RankPromotionType },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof RankPromotionType,
      cell: (item: RankPromotionType) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: RankPromotionType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: RankPromotionType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (item: RankPromotionType) => {
    toast({
      title: 'View Rank Promotion Condition',
      description: `Viewing details for condition ID: ${item.id}`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await rankPromotionService.deleteRankPromotion(selectedItem.id);
      toast({
        title: 'Success',
        description: `Rank Promotion Condition has been deleted.`,
      });
      // Refresh the rank promotions list
      fetchRankPromotions();
    } catch (error: any) {
      console.error('Error deleting rank promotion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete rank promotion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateRankPromotion = async (data: RankPromotionFormValues) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await rankPromotionService.updateRankPromotion(selectedItem.id, data);
      toast({
        title: 'Success',
        description: `Rank Promotion Condition has been updated.`,
      });
      // Refresh the rank promotions list
      fetchRankPromotions();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating rank promotion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rank promotion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BaseTable
        items={items}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading || externalLoading}
        searchPlaceholder="Search rank promotion conditions..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the rank promotion condition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Rank Promotion Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Rank Promotion Condition</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRankPromotion)} className="space-y-4">
              <FormField
                control={form.control}
                name="rank_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                      disabled={isLoadingOptions}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ranks.map((rank) => (
                          <SelectItem key={rank.id} value={rank.id.toString()}>
                            {rank.rank_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kpi_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KPI</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                      disabled={isLoadingOptions}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select KPI" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kpis.map((kpi) => (
                          <SelectItem key={kpi.id} value={kpi.id.toString()}>
                            {kpi.kpi_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requirement_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirement</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                      disabled={isLoadingOptions}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select requirement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {requirements.map((requirement) => (
                          <SelectItem key={requirement.id} value={requirement.id.toString()}>
                            {requirement.requirement_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target_count_house"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Count (House)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter target count" 
                          {...field} 
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="target_count_condo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Count (Condo)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter target count" 
                          {...field} 
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="minimum_skillset_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Skillset Score</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter minimum score" 
                        {...field} 
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter timeframe in days" 
                        {...field} 
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 