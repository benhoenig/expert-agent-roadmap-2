import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { rankService, Rank } from '@/services/rankService';
import { kpiService, KPI } from '@/services/kpiService';
import { requirementService, Requirement } from '@/services/requirementService';
import { rankPromotionService } from '@/services/rankPromotionService';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Define the form schema
const batchPromotionSchema = z.object({
  rank_id: z.coerce.number().min(1, "Rank is required"),
  timeframe_days: z.coerce.number().min(1, "Timeframe must be at least 1 day"),
  action_kpis: z.array(z.object({
    kpi_id: z.coerce.number().min(1, "KPI is required"),
    target_count: z.coerce.number().min(0, "Target count must be at least 0"),
    target_count_house: z.coerce.number().min(0, "Target count must be at least 0"),
    target_count_condo: z.coerce.number().min(0, "Target count must be at least 0"),
    is_property_specific: z.boolean().default(false),
  })),
  skillset_kpis: z.array(z.object({
    kpi_id: z.coerce.number().min(1, "KPI is required"),
    minimum_score: z.coerce.number().min(0, "Minimum score must be at least 0"),
  })),
  requirements: z.array(z.object({
    requirement_id: z.coerce.number().min(1, "Requirement is required"),
    target_count: z.coerce.number().min(0, "Target count must be at least 0"),
  })),
});

type BatchPromotionFormValues = z.infer<typeof batchPromotionSchema>;

interface BatchRankPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchRankPromotionModal({ isOpen, onClose, onSuccess }: BatchRankPromotionModalProps) {
  const { toast } = useToast();
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [actionKPIs, setActionKPIs] = useState<KPI[]>([]);
  const [skillsetKPIs, setSkillsetKPIs] = useState<KPI[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("actions");

  // Initialize form with default values
  const form = useForm<BatchPromotionFormValues>({
    resolver: zodResolver(batchPromotionSchema),
    defaultValues: {
      rank_id: 0,
      timeframe_days: 30,
      action_kpis: [],
      skillset_kpis: [],
      requirements: [],
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        rank_id: 0,
        timeframe_days: 30,
        action_kpis: [],
        skillset_kpis: [],
        requirements: [],
      });
      fetchData();
    }
  }, [isOpen, form]);

  // Fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ranksData, kpisData, requirementsData] = await Promise.all([
        rankService.getAllRanks(),
        kpiService.getAllKPIs(),
        requirementService.getAllRequirements(),
      ]);
      
      setRanks(ranksData);
      
      // Split KPIs by type
      const actions = kpisData.filter(kpi => kpi.kpi_type === 'Action');
      const skillsets = kpisData.filter(kpi => kpi.kpi_type === 'Skillset');
      
      setActionKPIs(actions);
      setSkillsetKPIs(skillsets);
      setRequirements(requirementsData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new action KPI
  const addActionKPI = () => {
    const currentActionKPIs = form.getValues('action_kpis');
    form.setValue('action_kpis', [
      ...currentActionKPIs,
      { 
        kpi_id: 0, 
        target_count: 0, 
        target_count_house: 0, 
        target_count_condo: 0, 
        is_property_specific: false 
      }
    ]);
  };

  // Remove an action KPI
  const removeActionKPI = (index: number) => {
    const currentActionKPIs = form.getValues('action_kpis');
    form.setValue('action_kpis', currentActionKPIs.filter((_, i) => i !== index));
  };

  // Add a new skillset KPI
  const addSkillsetKPI = () => {
    const currentSkillsetKPIs = form.getValues('skillset_kpis');
    form.setValue('skillset_kpis', [
      ...currentSkillsetKPIs,
      { kpi_id: 0, minimum_score: 0 }
    ]);
  };

  // Remove a skillset KPI
  const removeSkillsetKPI = (index: number) => {
    const currentSkillsetKPIs = form.getValues('skillset_kpis');
    form.setValue('skillset_kpis', currentSkillsetKPIs.filter((_, i) => i !== index));
  };

  // Add a new requirement
  const addRequirement = () => {
    const currentRequirements = form.getValues('requirements');
    form.setValue('requirements', [
      ...currentRequirements,
      { requirement_id: 0, target_count: 0 }
    ]);
  };

  // Remove a requirement
  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues('requirements');
    form.setValue('requirements', currentRequirements.filter((_, i) => i !== index));
  };

  // Get KPI name by ID
  const getKpiName = (kpiId: number, type: 'action' | 'skillset') => {
    const kpis = type === 'action' ? actionKPIs : skillsetKPIs;
    const kpi = kpis.find(k => k.id === kpiId);
    return kpi ? kpi.kpi_name : 'Select KPI';
  };

  // Get requirement name by ID
  const getRequirementName = (reqId: number) => {
    const req = requirements.find(r => r.id === reqId);
    return req ? req.requirement_name : 'Select Requirement';
  };

  // Handle form submission
  const onSubmit = async (data: BatchPromotionFormValues) => {
    setIsSubmitting(true);
    try {
      // Collect all conditions that need to be created
      const allConditions = [
        // Action KPIs
        ...data.action_kpis
          .filter(action => action.kpi_id > 0)
          .map(action => ({
            rank_id: data.rank_id,
            kpi_id: action.kpi_id,
            requirement_id: 0, // No requirement for this condition
            target_count_house: action.is_property_specific ? action.target_count_house : action.target_count,
            target_count_condo: action.is_property_specific ? action.target_count_condo : action.target_count,
            minimum_skillset_score: 0, // Not applicable for action KPIs
            timeframe_days: data.timeframe_days
          })),
        
        // Skillset KPIs
        ...data.skillset_kpis
          .filter(skillset => skillset.kpi_id > 0)
          .map(skillset => ({
            rank_id: data.rank_id,
            kpi_id: skillset.kpi_id,
            requirement_id: 0, // No requirement for this condition
            target_count_house: 0, // Not applicable for skillset KPIs
            target_count_condo: 0, // Not applicable for skillset KPIs
            minimum_skillset_score: skillset.minimum_score,
            timeframe_days: data.timeframe_days
          })),
        
        // Requirements
        ...data.requirements
          .filter(req => req.requirement_id > 0)
          .map(req => ({
            rank_id: data.rank_id,
            kpi_id: 0, // No KPI for this condition
            requirement_id: req.requirement_id,
            target_count_house: req.target_count, // Same count for both property types
            target_count_condo: req.target_count, // Same count for both property types
            minimum_skillset_score: 0, // Not applicable for requirements
            timeframe_days: data.timeframe_days
          }))
      ];

      // Function to add delay between requests
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Process conditions sequentially with delay to avoid rate limiting
      let successCount = 0;
      for (const condition of allConditions) {
        try {
          await rankPromotionService.createRankPromotion(condition);
          successCount++;
          
          // Add a delay between requests to avoid rate limiting
          await delay(300); // 300ms delay between requests
        } catch (error: any) {
          console.error('Error creating condition:', error);
          // Continue with the next condition even if one fails
        }
      }

      toast({
        title: 'Success',
        description: `${successCount} of ${allConditions.length} rank promotion conditions have been created.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating rank promotion conditions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rank promotion conditions',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected rank name
  const getSelectedRankName = () => {
    const rankId = form.getValues('rank_id');
    const rank = ranks.find(r => r.id === rankId);
    return rank ? rank.rank_name : 'Select Rank';
  };

  // Count total conditions
  const getTotalConditions = () => {
    const actionCount = form.getValues('action_kpis').filter(a => a.kpi_id > 0).length;
    const skillsetCount = form.getValues('skillset_kpis').filter(s => s.kpi_id > 0).length;
    const requirementCount = form.getValues('requirements').filter(r => r.requirement_id > 0).length;
    return actionCount + skillsetCount + requirementCount;
  };

  // Handle property specific toggle change
  const handlePropertySpecificChange = (index: number, value: boolean) => {
    form.setValue(`action_kpis.${index}.is_property_specific`, value);
    
    // If turning on property specific, set house and condo values to the current target count
    if (value) {
      const currentCount = form.getValues(`action_kpis.${index}.target_count`);
      form.setValue(`action_kpis.${index}.target_count_house`, currentCount);
      form.setValue(`action_kpis.${index}.target_count_condo`, currentCount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Rank Promotion Conditions</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Promotion Conditions Summary</CardTitle>
                <CardDescription>
                  Configure multiple conditions for rank promotion in one go
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Selected Rank:</span>
                    <span>{getSelectedRankName()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Timeframe:</span>
                    <span>{form.getValues('timeframe_days')} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Conditions:</span>
                    <Badge variant="outline">{getTotalConditions()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rank Selection */}
            <FormField
              control={form.control}
              name="rank_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value ? field.value.toString() : undefined}
                    disabled={isLoading}
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

            {/* Timeframe */}
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

            {/* Tabs for different condition types */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">
                  Action KPIs
                  {form.watch('action_kpis').length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {form.watch('action_kpis').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="skillsets">
                  Skillset KPIs
                  {form.watch('skillset_kpis').length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {form.watch('skillset_kpis').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requirements">
                  Requirements
                  {form.watch('requirements').length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {form.watch('requirements').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Action KPIs Tab */}
              <TabsContent value="actions" className="space-y-4">
                {form.watch('action_kpis').map((actionKpi, index) => (
                  <div key={index} className="flex flex-col gap-4 p-4 border rounded-md">
                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`action_kpis.${index}.kpi_id`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Action KPI</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value ? field.value.toString() : undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select KPI" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {actionKPIs.map((kpi) => (
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
                      
                      {!actionKpi.is_property_specific && (
                        <FormField
                          control={form.control}
                          name={`action_kpis.${index}.target_count`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Target Count</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter count" 
                                  {...field} 
                                  min={0}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name={`action_kpis.${index}.is_property_specific`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-end space-x-2 pt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => handlePropertySpecificChange(index, value)}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Property Specific
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removeActionKPI(index)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {actionKpi.is_property_specific && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`action_kpis.${index}.target_count_house`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Count (House)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter count for houses" 
                                  {...field} 
                                  min={0}
                                />
                              </FormControl>
                              <FormDescription>
                                Count required for house property type
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`action_kpis.${index}.target_count_condo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Count (Condo)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter count for condos" 
                                  {...field} 
                                  min={0}
                                />
                              </FormControl>
                              <FormDescription>
                                Count required for condo property type
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addActionKPI}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Action KPI
                </Button>
              </TabsContent>
              
              {/* Skillset KPIs Tab */}
              <TabsContent value="skillsets" className="space-y-4">
                {form.watch('skillset_kpis').map((_, index) => (
                  <div key={index} className="flex items-end gap-2 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`skillset_kpis.${index}.kpi_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Skillset KPI</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select KPI" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {skillsetKPIs.map((kpi) => (
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
                      name={`skillset_kpis.${index}.minimum_score`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Minimum Score</FormLabel>
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
                    
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => removeSkillsetKPI(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addSkillsetKPI}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skillset KPI
                </Button>
              </TabsContent>
              
              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-4">
                {form.watch('requirements').map((_, index) => (
                  <div key={index} className="flex items-end gap-2 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`requirements.${index}.requirement_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Requirement</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value ? field.value.toString() : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select requirement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {requirements.map((req) => (
                                <SelectItem key={req.id} value={req.id.toString()}>
                                  {req.requirement_name}
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
                      name={`requirements.${index}.target_count`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Target Count</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter count" 
                              {...field} 
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addRequirement}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Requirement
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save All Conditions"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 