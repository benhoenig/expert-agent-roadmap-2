import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { xanoService } from "@/services/xanoService";
import { SetTargetsModal } from "../dashboard/modals/SetTargetsModal";

// Types for our target data
interface TargetSummary {
  week_id: number;
  week_name: string;
  sales_id: number;
  sales_name: string;
  kpi_count: number;
  requirement_count: number;
}

interface TargetDetails {
  action_kpis: {
    name: string;
    target_value: number;
  }[];
  skillset_kpis: {
    name: string;
    target_value: number;
  }[];
  requirements: {
    name: string;
    target_value: number;
  }[];
}

export function GoalsAndTargetsPage() {
  // State for target data
  const [targetSummaries, setTargetSummaries] = useState<TargetSummary[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [targetDetails, setTargetDetails] = useState<TargetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // State for filters
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [salesFilter, setSalesFilter] = useState<string>("all");
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedSales, setSelectedSales] = useState<number | null>(null);
  
  // Mock data for weeks and sales (replace with API calls)
  const weeks = [
    { id: 1, name: "Week 1 (Jan 1-7, 2023)" },
    { id: 2, name: "Week 2 (Jan 8-14, 2023)" },
    { id: 3, name: "Week 3 (Jan 15-21, 2023)" },
  ];
  
  const salesTeam = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alex Johnson" },
  ];
  
  // Mock data for targets (replace with API calls)
  const mockTargetSummaries: TargetSummary[] = [
    { week_id: 1, week_name: "Week 1", sales_id: 1, sales_name: "John Doe", kpi_count: 7, requirement_count: 3 },
    { week_id: 1, week_name: "Week 1", sales_id: 2, sales_name: "Jane Smith", kpi_count: 5, requirement_count: 2 },
    { week_id: 2, week_name: "Week 2", sales_id: 1, sales_name: "John Doe", kpi_count: 7, requirement_count: 3 },
    { week_id: 2, week_name: "Week 2", sales_id: 2, sales_name: "Jane Smith", kpi_count: 5, requirement_count: 2 },
  ];
  
  const mockTargetDetails: TargetDetails = {
    action_kpis: [
      { name: "Cold Calls", target_value: 20 },
      { name: "Property Visits", target_value: 5 },
      { name: "Client Meetings", target_value: 8 },
      { name: "Follow-up Calls", target_value: 15 },
    ],
    skillset_kpis: [
      { name: "Owner Script", target_value: 80 },
      { name: "Consulting Script", target_value: 75 },
      { name: "Buyer Script", target_value: 85 },
    ],
    requirements: [
      { name: "Training Attended", target_value: 1 },
      { name: "HOME Academy Video Watched", target_value: 2 },
      { name: "Real Case with Senior", target_value: 1 },
    ],
  };
  
  // Load target summaries on component mount
  useEffect(() => {
    // Replace with actual API call
    setIsLoading(true);
    setTimeout(() => {
      setTargetSummaries(mockTargetSummaries);
      setIsLoading(false);
    }, 1000);
    
    // Actual implementation would be:
    // const fetchTargetSummaries = async () => {
    //   try {
    //     setIsLoading(true);
    //     const response = await xanoService.getTargetSummaries();
    //     setTargetSummaries(response);
    //   } catch (error) {
    //     console.error("Error fetching target summaries:", error);
    //     toast.error("Failed to load targets");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchTargetSummaries();
  }, []);
  
  // Filter targets based on selected filters
  const filteredTargets = targetSummaries.filter(target => {
    const matchesWeek = weekFilter === "all" || target.week_id.toString() === weekFilter;
    const matchesSales = salesFilter === "all" || target.sales_id.toString() === salesFilter;
    return matchesWeek && matchesSales;
  });
  
  // Handle row expansion to show details
  const toggleRowExpansion = (weekId: number, salesId: number) => {
    const rowKey = `${weekId}-${salesId}`;
    
    if (expandedRow === rowKey) {
      setExpandedRow(null);
      setTargetDetails(null);
    } else {
      setExpandedRow(rowKey);
      setIsLoadingDetails(true);
      
      // Replace with actual API call
      setTimeout(() => {
        setTargetDetails(mockTargetDetails);
        setIsLoadingDetails(false);
      }, 500);
      
      // Actual implementation would be:
      // const fetchTargetDetails = async () => {
      //   try {
      //     setIsLoadingDetails(true);
      //     const response = await xanoService.getTargetDetails(weekId, salesId);
      //     setTargetDetails(response);
      //   } catch (error) {
      //     console.error("Error fetching target details:", error);
      //     toast.error("Failed to load target details");
      //   } finally {
      //     setIsLoadingDetails(false);
      //   }
      // };
      // fetchTargetDetails();
    }
  };
  
  // Handle opening the modal to set new targets
  const handleSetNewTargets = () => {
    setEditMode(false);
    setSelectedWeek(null);
    setSelectedSales(null);
    setIsModalOpen(true);
  };
  
  // Handle opening the modal to edit existing targets
  const handleEditTargets = (weekId: number, salesId: number) => {
    setEditMode(true);
    setSelectedWeek(weekId);
    setSelectedSales(salesId);
    setIsModalOpen(true);
  };
  
  // Handle deleting targets
  const handleDeleteTargets = (weekId: number, salesId: number) => {
    if (confirm(`Are you sure you want to delete all targets for ${salesTeam.find(s => s.id === salesId)?.name} in ${weeks.find(w => w.id === weekId)?.name}?`)) {
      // Replace with actual API call
      toast.success("Targets deleted successfully");
      
      // Actual implementation would be:
      // try {
      //   await xanoService.deleteTargets(weekId, salesId);
      //   toast.success("Targets deleted successfully");
      //   // Refresh the target summaries
      //   fetchTargetSummaries();
      // } catch (error) {
      //   console.error("Error deleting targets:", error);
      //   toast.error("Failed to delete targets");
      // }
    }
  };
  
  // Handle modal submission
  const handleModalSubmit = () => {
    setIsModalOpen(false);
    toast.success("Targets saved successfully");
    
    // Refresh the target summaries (replace with actual API call)
    setTimeout(() => {
      setTargetSummaries([...mockTargetSummaries]);
    }, 500);
  };
  
  return (
    <div className="py-4 space-y-4">
      <div className="flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">Goals & Targets</h1>
        <Button onClick={handleSetNewTargets}>+ Set New Targets</Button>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Target Management</CardTitle>
          <CardDescription>
            Set and manage weekly targets for your sales team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1 block">Week</label>
              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {weeks.map(week => (
                    <SelectItem key={week.id} value={week.id.toString()}>
                      {week.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1 block">Sales Team Member</label>
              <Select value={salesFilter} onValueChange={setSalesFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales</SelectItem>
                  {salesTeam.map(sales => (
                    <SelectItem key={sales.id} value={sales.id.toString()}>
                      {sales.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Target Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Week</TableHead>
                  <TableHead className="w-[140px]">Sales Team Member</TableHead>
                  <TableHead className="w-[100px]">KPI Targets</TableHead>
                  <TableHead className="w-[120px]">Requirement Targets</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Loading targets...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTargets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No targets found. Click "Set New Targets" to create some.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTargets.map(target => {
                    const rowKey = `${target.week_id}-${target.sales_id}`;
                    const isExpanded = expandedRow === rowKey;
                    
                    return (
                      <>
                        <TableRow key={rowKey} className={isExpanded ? "bg-muted/50" : ""}>
                          <TableCell className="py-2">{target.week_name}</TableCell>
                          <TableCell className="py-2">{target.sales_name}</TableCell>
                          <TableCell className="py-2">{target.kpi_count} KPIs</TableCell>
                          <TableCell className="py-2">{target.requirement_count} Requirements</TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => toggleRowExpansion(target.week_id, target.sales_id)}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditTargets(target.week_id, target.sales_id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteTargets(target.week_id, target.sales_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Row with Details */}
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/30 p-3">
                              {isLoadingDetails ? (
                                <div className="flex justify-center items-center py-3">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  <span>Loading details...</span>
                                </div>
                              ) : targetDetails ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Action KPIs */}
                                    {targetDetails.action_kpis.length > 0 && (
                                      <div className="space-y-2">
                                        <h3 className="font-medium text-sm">KPI Targets (Action):</h3>
                                        <ul className="space-y-1 pl-4 list-disc text-sm">
                                          {targetDetails.action_kpis.map((kpi, index) => (
                                            <li key={index}>
                                              <span className="font-medium">{kpi.name}:</span> {kpi.target_value} per week
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Skillset KPIs */}
                                    {targetDetails.skillset_kpis.length > 0 && (
                                      <div className="space-y-2">
                                        <h3 className="font-medium text-sm">KPI Targets (Skillset):</h3>
                                        <ul className="space-y-1 pl-4 list-disc text-sm">
                                          {targetDetails.skillset_kpis.map((kpi, index) => (
                                            <li key={index}>
                                              <span className="font-medium">{kpi.name}:</span> {kpi.target_value} minimum score
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Requirements */}
                                    {targetDetails.requirements.length > 0 && (
                                      <div className="space-y-2">
                                        <h3 className="font-medium text-sm">Requirement Targets:</h3>
                                        <ul className="space-y-1 pl-4 list-disc text-sm">
                                          {targetDetails.requirements.map((req, index) => (
                                            <li key={index}>
                                              <span className="font-medium">{req.name}:</span> {req.target_value} per week
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="pt-1">
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditTargets(target.week_id, target.sales_id)}
                                    >
                                      Edit All Targets
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-3 text-center">No details available</div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Set Targets Modal */}
      <SetTargetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editMode={editMode}
        weekId={selectedWeek}
        salesId={selectedSales}
        weeks={weeks}
        salesTeam={salesTeam}
      />
    </div>
  );
} 