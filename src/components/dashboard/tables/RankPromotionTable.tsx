import { useState, useEffect } from 'react';
import { useToast } from '../../ui/use-toast';
import { 
  rankPromotionService, 
  RankPromotion as RankPromotionType 
} from '../../../services/rankPromotionService';
import { rankService, Rank } from '../../../services/rankService';
import { kpiService, KPI } from '../../../services/kpiService';
import { requirementService, Requirement } from '../../../services/requirementService';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Edit, Trash2, Eye, Plus, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { BatchRankPromotionModal } from "../modals/BatchRankPromotionModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RankPromotionTableProps {
  isLoading: boolean;
}

// Define a type for grouped conditions
interface GroupedConditions {
  rank: Rank;
  actionKPIs: {
    kpi: KPI;
    target_count_house: number;
    target_count_condo: number;
    id: number;
    timeframe_days: number;
  }[];
  skillsetKPIs: {
    kpi: KPI;
    minimum_skillset_score: number;
    id: number;
    timeframe_days: number;
  }[];
  requirements: {
    requirement: Requirement;
    target_count: number;
    id: number;
    timeframe_days: number;
  }[];
}

export function RankPromotionTable({ isLoading: externalLoading }: RankPromotionTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RankPromotionType[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedConditions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRanks, setExpandedRanks] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for dropdown options
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  // Helper function to add delay between API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch rank promotions and dropdown options on component mount
  useEffect(() => {
    fetchRankPromotions();
    fetchDropdownOptions();
  }, []);

  // Fetch rank promotions from the API
  const fetchRankPromotions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promotions = await rankPromotionService.getAllRankPromotions();
      setItems(promotions);
      
      // Group the promotions by rank
      if (ranks.length > 0 && kpis.length > 0 && requirements.length > 0) {
        groupPromotionsByRank(promotions);
      }
    } catch (error: any) {
      console.error('Error fetching rank promotions:', error);
      setError('Failed to fetch rank promotion conditions. Please try again later.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch rank promotions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dropdown options from the API sequentially to avoid rate limiting
  const fetchDropdownOptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch ranks first
      const ranksData = await rankService.getAllRanks();
      setRanks(ranksData);
      
      // Add delay before next request
      await delay(500);
      
      // Fetch KPIs next
      const kpisData = await kpiService.getAllKPIs();
      setKpis(kpisData);
      
      // Add delay before next request
      await delay(500);
      
      // Fetch requirements last
      const requirementsData = await requirementService.getAllRequirements();
      setRequirements(requirementsData);
      
      // If we already have items, group them now that we have the reference data
      if (items.length > 0) {
        groupPromotionsByRank(items);
      }
    } catch (error: any) {
      console.error('Error fetching dropdown options:', error);
      setError('Failed to fetch necessary data. Please try refreshing the page.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch dropdown options',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchRankPromotions();
      await fetchDropdownOptions();
      toast({
        title: 'Success',
        description: 'Data refreshed successfully',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group promotions by rank
  const groupPromotionsByRank = (promotions: RankPromotionType[]) => {
    // Create a map of rank IDs to their conditions
    const rankMap = new Map<number, GroupedConditions>();
    
    // Initialize the map with all ranks
    ranks.forEach(rank => {
      rankMap.set(rank.id, {
        rank,
        actionKPIs: [],
        skillsetKPIs: [],
        requirements: []
      });
    });
    
    // Populate the map with conditions
    promotions.forEach(promotion => {
      const rankId = promotion.rank_id;
      
      // Skip if rank doesn't exist in our data
      if (!rankMap.has(rankId)) return;
      
      const groupedCondition = rankMap.get(rankId)!;
      
      // Add to the appropriate category
      if (promotion.kpi_id > 0) {
        const kpi = kpis.find(k => k.id === promotion.kpi_id);
        if (kpi) {
          if (kpi.kpi_type === 'Action') {
            groupedCondition.actionKPIs.push({
              kpi,
              target_count_house: promotion.target_count_house,
              target_count_condo: promotion.target_count_condo,
              id: promotion.id,
              timeframe_days: promotion.timeframe_days
            });
          } else if (kpi.kpi_type === 'Skillset') {
            groupedCondition.skillsetKPIs.push({
              kpi,
              minimum_skillset_score: promotion.minimum_skillset_score,
              id: promotion.id,
              timeframe_days: promotion.timeframe_days
            });
          }
        }
      } else if (promotion.requirement_id > 0) {
        const requirement = requirements.find(r => r.id === promotion.requirement_id);
        if (requirement) {
          groupedCondition.requirements.push({
            requirement,
            target_count: promotion.target_count_house, // Using house count as the general count
            id: promotion.id,
            timeframe_days: promotion.timeframe_days
          });
        }
      }
    });
    
    // Convert map to array and filter out ranks with no conditions
    const groupedArray = Array.from(rankMap.values())
      .filter(group => 
        group.actionKPIs.length > 0 || 
        group.skillsetKPIs.length > 0 || 
        group.requirements.length > 0
      )
      .sort((a, b) => a.rank.rank_level - b.rank.rank_level);
    
    setGroupedItems(groupedArray);
  };

  // Toggle expanded state for a rank
  const toggleRankExpanded = (rankId: number) => {
    setExpandedRanks(prev => 
      prev.includes(rankId) 
        ? prev.filter(id => id !== rankId) 
        : [...prev, rankId]
    );
  };

  // Handle condition deletion
  const handleDeleteCondition = (conditionId: number) => {
    setSelectedConditionId(conditionId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!selectedConditionId) return;
    
    setIsSubmitting(true);
    try {
      await rankPromotionService.deleteRankPromotion(selectedConditionId);
      toast({
        title: 'Success',
        description: 'Condition has been deleted.',
      });
      fetchRankPromotions();
    } catch (error: any) {
      console.error('Error deleting condition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete condition',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle adding new conditions
  const handleAddConditions = () => {
    setIsBatchModalOpen(true);
  };

  // Filter grouped items based on search term
  const filteredItems = searchTerm 
    ? groupedItems.filter(group => 
        group.rank.rank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.actionKPIs.some(item => item.kpi.kpi_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        group.skillsetKPIs.some(item => item.kpi.kpi_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        group.requirements.some(item => item.requirement.requirement_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : groupedItems;

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search rank promotion conditions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData} 
              disabled={isRefreshing || isLoading}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button onClick={handleAddConditions}>
              <Plus className="mr-2 h-4 w-4" />
              Add Conditions
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Try Again'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading || externalLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No rank promotion conditions found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((group) => (
              <Card key={group.rank.id} className="overflow-hidden">
                <Collapsible
                  open={expandedRanks.includes(group.rank.id)}
                  onOpenChange={() => toggleRankExpanded(group.rank.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {expandedRanks.includes(group.rank.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <CardTitle>{group.rank.rank_name}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            Level {group.rank.rank_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {group.actionKPIs.length + group.skillsetKPIs.length + group.requirements.length} Conditions
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Action KPIs */}
                      {group.actionKPIs.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Action KPIs</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>KPI Name</TableHead>
                                <TableHead>Target (House)</TableHead>
                                <TableHead>Target (Condo)</TableHead>
                                <TableHead>Timeframe (Days)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.actionKPIs.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.kpi.kpi_name}</TableCell>
                                  <TableCell>{item.target_count_house}</TableCell>
                                  <TableCell>{item.target_count_condo}</TableCell>
                                  <TableCell>{item.timeframe_days}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteCondition(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Skillset KPIs */}
                      {group.skillsetKPIs.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Skillset KPIs</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>KPI Name</TableHead>
                                <TableHead>Minimum Score</TableHead>
                                <TableHead>Timeframe (Days)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.skillsetKPIs.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.kpi.kpi_name}</TableCell>
                                  <TableCell>{item.minimum_skillset_score}</TableCell>
                                  <TableCell>{item.timeframe_days}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteCondition(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Requirements */}
                      {group.requirements.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Requirement Name</TableHead>
                                <TableHead>Target Count</TableHead>
                                <TableHead>Timeframe (Days)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.requirements.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.requirement.requirement_name}</TableCell>
                                  <TableCell>{item.target_count}</TableCell>
                                  <TableCell>{item.timeframe_days}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteCondition(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 py-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsBatchModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add More Conditions
                      </Button>
                    </CardFooter>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promotion condition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Add Modal */}
      <BatchRankPromotionModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={fetchRankPromotions}
        // Pass the already fetched data to avoid redundant API calls
        initialData={{
          ranks,
          kpis,
          requirements
        }}
      />
    </>
  );
} 