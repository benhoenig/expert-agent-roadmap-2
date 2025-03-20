import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { xanoService } from "@/services/xanoService";

// Types
interface Week {
  id: number;
  name: string;
}

interface SalesTeamMember {
  id: number;
  name: string;
}

interface ActionKPI {
  id: number;
  name: string;
  enabled: boolean;
  target_value: number;
}

interface SkillsetKPI {
  id: number;
  name: string;
  enabled: boolean;
  target_value: number;
}

interface Requirement {
  id: number;
  name: string;
  enabled: boolean;
  target_value: number;
}

interface SetTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editMode: boolean;
  weekId: number | null;
  salesId: number | null;
  weeks: Week[];
  salesTeam: SalesTeamMember[];
}

export function SetTargetsModal({
  isOpen,
  onClose,
  onSubmit,
  editMode,
  weekId,
  salesId,
  weeks,
  salesTeam
}: SetTargetsModalProps) {
  // State for form fields
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedSales, setSelectedSales] = useState<string>("");
  const [activeTab, setActiveTab] = useState("action-kpis");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for KPIs and Requirements
  const [actionKPIs, setActionKPIs] = useState<ActionKPI[]>([]);
  const [skillsetKPIs, setSkillsetKPIs] = useState<SkillsetKPI[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  
  // Mock data for KPIs and Requirements (replace with API calls)
  const mockActionKPIs: ActionKPI[] = [
    { id: 1, name: "Cold Calls", enabled: true, target_value: 20 },
    { id: 2, name: "Property Visits", enabled: true, target_value: 5 },
    { id: 3, name: "Client Meetings", enabled: true, target_value: 8 },
    { id: 4, name: "Follow-up Calls", enabled: true, target_value: 15 },
    { id: 5, name: "Listings Secured", enabled: true, target_value: 2 },
  ];
  
  const mockSkillsetKPIs: SkillsetKPI[] = [
    { id: 1, name: "Owner Script", enabled: true, target_value: 80 },
    { id: 2, name: "Consulting Script", enabled: true, target_value: 75 },
    { id: 3, name: "Buyer Script", enabled: true, target_value: 85 },
    { id: 4, name: "Objection Handling", enabled: true, target_value: 70 },
    { id: 5, name: "Closing Techniques", enabled: true, target_value: 75 },
  ];
  
  const mockRequirements: Requirement[] = [
    { id: 1, name: "Training Attended", enabled: true, target_value: 1 },
    { id: 2, name: "HOME Academy Video Watched", enabled: true, target_value: 2 },
    { id: 3, name: "Real Case with Senior", enabled: true, target_value: 1 },
    { id: 4, name: "Role Play Sessions", enabled: true, target_value: 2 },
    { id: 5, name: "Team Meetings", enabled: true, target_value: 1 },
  ];
  
  // Initialize form when modal opens or edit mode changes
  useEffect(() => {
    if (isOpen) {
      if (editMode && weekId && salesId) {
        // Set selected values for edit mode
        setSelectedWeek(weekId.toString());
        setSelectedSales(salesId.toString());
        
        // Fetch existing targets (replace with API call)
        setIsLoading(true);
        setTimeout(() => {
          setActionKPIs(mockActionKPIs);
          setSkillsetKPIs(mockSkillsetKPIs);
          setRequirements(mockRequirements);
          setIsLoading(false);
        }, 1000);
        
        // Actual implementation would be:
        // const fetchTargets = async () => {
        //   try {
        //     setIsLoading(true);
        //     const response = await xanoService.getTargetDetails(weekId, salesId);
        //     
        //     // Transform response to match our state structure
        //     setActionKPIs(response.action_kpis.map(kpi => ({
        //       id: kpi.id,
        //       name: kpi.name,
        //       enabled: true,
        //       target_value: kpi.target_value
        //     })));
        //     
        //     setSkillsetKPIs(response.skillset_kpis.map(kpi => ({
        //       id: kpi.id,
        //       name: kpi.name,
        //       enabled: true,
        //       target_value: kpi.target_value
        //     })));
        //     
        //     setRequirements(response.requirements.map(req => ({
        //       id: req.id,
        //       name: req.name,
        //       enabled: true,
        //       target_value: req.target_value
        //     })));
        //   } catch (error) {
        //     console.error("Error fetching targets:", error);
        //     toast.error("Failed to load existing targets");
        //   } finally {
        //     setIsLoading(false);
        //   }
        // };
        // fetchTargets();
      } else {
        // Reset form for new targets
        setSelectedWeek("");
        setSelectedSales("");
        setActionKPIs(mockActionKPIs.map(kpi => ({ ...kpi, enabled: false, target_value: 0 })));
        setSkillsetKPIs(mockSkillsetKPIs.map(kpi => ({ ...kpi, enabled: false, target_value: 0 })));
        setRequirements(mockRequirements.map(req => ({ ...req, enabled: false, target_value: 0 })));
      }
    }
  }, [isOpen, editMode, weekId, salesId]);
  
  // Handle toggle all for a category
  const handleToggleAllAction = (enabled: boolean) => {
    setActionKPIs(actionKPIs.map(kpi => ({ ...kpi, enabled })));
  };
  
  const handleToggleAllSkillset = (enabled: boolean) => {
    setSkillsetKPIs(skillsetKPIs.map(kpi => ({ ...kpi, enabled })));
  };
  
  const handleToggleAllRequirements = (enabled: boolean) => {
    setRequirements(requirements.map(req => ({ ...req, enabled })));
  };
  
  // Handle toggle for individual items
  const handleToggleActionKPI = (id: number, enabled: boolean) => {
    setActionKPIs(actionKPIs.map(kpi => 
      kpi.id === id ? { ...kpi, enabled } : kpi
    ));
  };
  
  const handleToggleSkillsetKPI = (id: number, enabled: boolean) => {
    setSkillsetKPIs(skillsetKPIs.map(kpi => 
      kpi.id === id ? { ...kpi, enabled } : kpi
    ));
  };
  
  const handleToggleRequirement = (id: number, enabled: boolean) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, enabled } : req
    ));
  };
  
  // Handle value changes
  const handleActionKPIValueChange = (id: number, value: string) => {
    setActionKPIs(actionKPIs.map(kpi => 
      kpi.id === id ? { ...kpi, target_value: parseInt(value) || 0 } : kpi
    ));
  };
  
  const handleSkillsetKPIValueChange = (id: number, value: string) => {
    setSkillsetKPIs(skillsetKPIs.map(kpi => 
      kpi.id === id ? { ...kpi, target_value: parseInt(value) || 0 } : kpi
    ));
  };
  
  const handleRequirementValueChange = (id: number, value: string) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, target_value: parseInt(value) || 0 } : req
    ));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!selectedWeek) {
      toast.error("Please select a week");
      return;
    }
    
    if (!selectedSales) {
      toast.error("Please select a sales team member");
      return;
    }
    
    // Check if any targets are enabled
    const hasEnabledTargets = 
      actionKPIs.some(kpi => kpi.enabled) || 
      skillsetKPIs.some(kpi => kpi.enabled) || 
      requirements.some(req => req.enabled);
    
    if (!hasEnabledTargets) {
      toast.error("Please enable at least one target");
      return;
    }
    
    // Prepare data for submission
    const targetData = {
      week_id: parseInt(selectedWeek),
      sales_id: parseInt(selectedSales),
      action_kpis: actionKPIs
        .filter(kpi => kpi.enabled)
        .map(kpi => ({
          id: kpi.id,
          name: kpi.name,
          target_value: kpi.target_value
        })),
      skillset_kpis: skillsetKPIs
        .filter(kpi => kpi.enabled)
        .map(kpi => ({
          id: kpi.id,
          name: kpi.name,
          target_value: kpi.target_value
        })),
      requirements: requirements
        .filter(req => req.enabled)
        .map(req => ({
          id: req.id,
          name: req.name,
          target_value: req.target_value
        }))
    };
    
    // Submit data (replace with API call)
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSubmit();
    }, 1000);
    
    // Actual implementation would be:
    // try {
    //   setIsSaving(true);
    //   if (editMode) {
    //     await xanoService.updateTargets(targetData);
    //   } else {
    //     await xanoService.createTargets(targetData);
    //   }
    //   onSubmit();
    // } catch (error) {
    //   console.error("Error saving targets:", error);
    //   toast.error("Failed to save targets");
    // } finally {
    //   setIsSaving(false);
    // }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Weekly Targets" : "Set Weekly Targets"}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? "Modify targets for the selected week and sales team member" 
              : "Set targets for a specific week and sales team member"}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading targets...</span>
          </div>
        ) : (
          <>
            {/* Week and Sales Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="week">Week</Label>
                <Select 
                  value={selectedWeek} 
                  onValueChange={setSelectedWeek}
                  disabled={editMode}
                >
                  <SelectTrigger id="week">
                    <SelectValue placeholder="Select a week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map(week => (
                      <SelectItem key={week.id} value={week.id.toString()}>
                        {week.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sales">Sales Team Member</Label>
                <Select 
                  value={selectedSales} 
                  onValueChange={setSelectedSales}
                  disabled={editMode}
                >
                  <SelectTrigger id="sales">
                    <SelectValue placeholder="Select a sales team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesTeam.map(sales => (
                      <SelectItem key={sales.id} value={sales.id.toString()}>
                        {sales.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tabs for different target categories */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="action-kpis">Action KPIs</TabsTrigger>
                <TabsTrigger value="skillset-kpis">Skillset KPIs</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              
              {/* Action KPIs Tab */}
              <TabsContent value="action-kpis" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Action KPI Targets</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllAction(true)}
                    >
                      Enable All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllAction(false)}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {actionKPIs.map(kpi => (
                    <div key={kpi.id} className="flex items-center gap-4 p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={kpi.enabled}
                          onCheckedChange={(checked) => handleToggleActionKPI(kpi.id, checked)}
                        />
                        <Label className={kpi.enabled ? "" : "text-muted-foreground"}>
                          {kpi.name}
                        </Label>
                      </div>
                      <div className="ml-auto w-32">
                        <Input
                          type="number"
                          min="0"
                          value={kpi.target_value}
                          onChange={(e) => handleActionKPIValueChange(kpi.id, e.target.value)}
                          disabled={!kpi.enabled}
                          className={!kpi.enabled ? "opacity-50" : ""}
                        />
                      </div>
                      <div className="w-24 text-sm text-muted-foreground">
                        per week
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Skillset KPIs Tab */}
              <TabsContent value="skillset-kpis" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Skillset KPI Targets</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllSkillset(true)}
                    >
                      Enable All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllSkillset(false)}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {skillsetKPIs.map(kpi => (
                    <div key={kpi.id} className="flex items-center gap-4 p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={kpi.enabled}
                          onCheckedChange={(checked) => handleToggleSkillsetKPI(kpi.id, checked)}
                        />
                        <Label className={kpi.enabled ? "" : "text-muted-foreground"}>
                          {kpi.name}
                        </Label>
                      </div>
                      <div className="ml-auto w-32">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={kpi.target_value}
                          onChange={(e) => handleSkillsetKPIValueChange(kpi.id, e.target.value)}
                          disabled={!kpi.enabled}
                          className={!kpi.enabled ? "opacity-50" : ""}
                        />
                      </div>
                      <div className="w-24 text-sm text-muted-foreground">
                        minimum score
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Requirement Targets</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllRequirements(true)}
                    >
                      Enable All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAllRequirements(false)}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {requirements.map(req => (
                    <div key={req.id} className="flex items-center gap-4 p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={req.enabled}
                          onCheckedChange={(checked) => handleToggleRequirement(req.id, checked)}
                        />
                        <Label className={req.enabled ? "" : "text-muted-foreground"}>
                          {req.name}
                        </Label>
                      </div>
                      <div className="ml-auto w-32">
                        <Input
                          type="number"
                          min="0"
                          value={req.target_value}
                          onChange={(e) => handleRequirementValueChange(req.id, e.target.value)}
                          disabled={!req.enabled}
                          className={!req.enabled ? "opacity-50" : ""}
                        />
                      </div>
                      <div className="w-24 text-sm text-muted-foreground">
                        per week
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editMode ? "Update Targets" : "Save Targets"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 