import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PaperclipIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { xanoService } from "@/services/xanoService";

interface KPIFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

type KPIType = "Action" | "Skillset";

interface KPI {
  id: number;
  created_at?: string;
  kpi_name: string;
  kpi_type: string;
}

export function KPIForm({ onCancel, onSubmit }: KPIFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [kpiType, setKpiType] = useState<KPIType | "">("");
  const [kpiName, setKpiName] = useState<string>("");
  const [kpiId, setKpiId] = useState<number | null>(null);
  const [actionCount, setActionCount] = useState<number>(0);
  const [wordingScore, setWordingScore] = useState<number>(0);
  const [tonalityScore, setTonalityScore] = useState<number>(0);
  const [rapportScore, setRapportScore] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [weekId, setWeekId] = useState<number | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(false);

  // Filter KPIs by type - adjust the filter to match the actual enum values in the database
  const actionKPIs = kpis.filter(kpi => kpi.kpi_type === "Action" || kpi.kpi_type === "action");
  const skillsetKPIs = kpis.filter(kpi => kpi.kpi_type === "Skillset" || kpi.kpi_type === "skillset");

  // Fetch KPIs, user data, and current week on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userData = await xanoService.getUserData();
        console.log("User data fetched:", userData);
        
        // DEBUG: Log the user data structure
        console.log("DEBUG: User data structure:", JSON.stringify(userData));
        
        if (userData && userData.id) {
          setUserId(userData.id);
          // DEBUG: Log the user ID being set
          console.log("DEBUG: Setting userId state to:", userData.id, "Type:", typeof userData.id);
        } else {
          console.warn("User data fetched but no ID found:", userData);
          // DEBUG: Log all keys in userData
          if (userData) {
            console.log("DEBUG: Available keys in userData:", Object.keys(userData));
            // Check if there's any field that might contain the user ID
            Object.entries(userData).forEach(([key, value]) => {
              if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseInt(value as string)))) {
                console.log(`DEBUG: Potential ID field - ${key}:`, value);
              }
            });
          }
        }

        // Fetch current week
        try {
          const currentWeek = await xanoService.getCurrentWeek();
          console.log("Current week fetched:", currentWeek);
          if (currentWeek && currentWeek.id) {
            setWeekId(currentWeek.id);
          } else {
            console.warn("Current week fetched but no ID found:", currentWeek);
            // Set a default week ID of 1
            setWeekId(1);
          }
        } catch (error) {
          console.error("Error fetching current week:", error);
          // Set a default week ID of 1
          setWeekId(1);
        }

        // Fetch KPI data
        setIsLoadingKpis(true);
        const kpiData = await xanoService.getAllKPIs();
        console.log("KPI data fetched:", kpiData);
        
        if (Array.isArray(kpiData)) {
          // Log each KPI to debug the structure
          kpiData.forEach(kpi => {
            console.log(`KPI: id=${kpi.id}, name=${kpi.kpi_name}, type=${kpi.kpi_type}`);
          });
          
          setKpis(kpiData);
          
          // Log the filtered KPIs
          const actionKPIs = kpiData.filter(kpi => kpi.kpi_type === "Action" || kpi.kpi_type === "action");
          const skillsetKPIs = kpiData.filter(kpi => kpi.kpi_type === "Skillset" || kpi.kpi_type === "skillset");
          
          console.log(`Found ${actionKPIs.length} Action KPIs and ${skillsetKPIs.length} Skillset KPIs`);
        } else {
          console.warn("KPI data is not an array:", kpiData);
          setKpis([]);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load KPI data. Some features may be limited.");
      } finally {
        setIsLoadingKpis(false);
      }
    };

    fetchData();
  }, []);

  // Update KPI ID when KPI name changes
  useEffect(() => {
    if (kpiName) {
      const selectedKpi = kpis.find(kpi => kpi.kpi_name === kpiName);
      if (selectedKpi) {
        setKpiId(selectedKpi.id);
        console.log(`Selected KPI: ${kpiName} with ID: ${selectedKpi.id}`);
      } else {
        setKpiId(null);
        console.warn(`No KPI found with name: ${kpiName}`);
      }
    } else {
      setKpiId(null);
    }
  }, [kpiName, kpis]);

  // Calculate average score whenever sub-metric scores change
  useEffect(() => {
    if (kpiType === "Skillset") {
      const sum = wordingScore + tonalityScore + rapportScore;
      const avg = Math.round((sum / 3) * 10) / 10; // Round to 1 decimal place
      setAverageScore(avg);
    }
  }, [wordingScore, tonalityScore, rapportScore, kpiType]);

  // Reset scores when KPI type changes
  useEffect(() => {
    if (kpiType === "Action") {
      setActionCount(0);
      setWordingScore(0);
      setTonalityScore(0);
      setRapportScore(0);
    } else if (kpiType === "Skillset") {
      setActionCount(0);
    }
    // Reset KPI name when type changes
    setKpiName("");
  }, [kpiType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScoreChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setter(0);
    } else if (numValue > 100) {
      setter(100);
    } else if (numValue < 0) {
      setter(0);
    } else {
      setter(numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !kpiType || !kpiName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!kpiId) {
      toast.error("Invalid KPI selected. Please try again.");
      return;
    }

    // Validate specific fields based on KPI type
    if (kpiType === "Action" && actionCount <= 0) {
      toast.error("Action count must be greater than 0");
      return;
    } else if (kpiType === "Skillset" && (wordingScore <= 0 || tonalityScore <= 0 || rapportScore <= 0)) {
      toast.error("All scores must be greater than 0");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // DEBUG: Log the current userId state
      console.log("DEBUG: Current userId state:", userId, "Type:", typeof userId);
      
      // Prepare the progress data based on KPI type
      const progressData: any = {
        date: date,
        kpi_type: kpiType,
        kpi_name: kpiName,
        kpi_id: kpiId, // Include the KPI ID
        remark: remark || "",
      };

      // Add user_id if available
      if (userId) {
        // Ensure userId is a number
        progressData.user_id = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
        console.log(`Including user_id: ${userId} in KPI progress submission`);
        
        // Verify the type of userId
        console.log(`User ID type: ${typeof progressData.user_id}, value: ${progressData.user_id}`);
        
        // DEBUG: Additional checks for user_id
        console.log("DEBUG: progressData.user_id is NaN?", isNaN(progressData.user_id));
        console.log("DEBUG: progressData.user_id === 0?", progressData.user_id === 0);
        console.log("DEBUG: progressData.user_id === null?", progressData.user_id === null);
      } else {
        console.warn("No user ID available for KPI progress submission");
        toast.warning("User ID not available. Progress may not be associated with your account.");
        
        // DEBUG: Try to fetch user data again
        try {
          const userData = await xanoService.getUserData();
          console.log("DEBUG: Attempted to fetch user data again:", userData);
          if (userData && userData.id) {
            progressData.user_id = userData.id;
            console.log("DEBUG: Retrieved user_id directly:", userData.id);
          }
        } catch (error) {
          console.error("DEBUG: Error fetching user data again:", error);
        }
      }

      // Add week_id if available
      if (weekId) {
        progressData.week_id = weekId;
        console.log(`Including week_id: ${weekId} in KPI progress submission`);
      } else {
        console.warn("No week ID available for KPI progress submission");
      }

      // Add type-specific fields
      if (kpiType === "Action") {
        progressData.action_count = actionCount;
        console.log(`Adding action count: ${actionCount} for Action KPI with ID: ${kpiId}`);
        
        // Log the complete payload for Action KPI
        console.log("Action KPI progress payload:", {
          kpi_id: kpiId,
          sales_id: typeof userId === 'number' ? userId : parseInt(String(userId), 10),
          week_id: weekId,
          date_added: date instanceof Date ? date.toISOString().split('T')[0] : date,
          count: actionCount,
          remark: remark || "",
          updated_at: new Date().toISOString(),
          mentor_edited: 0
        });
      } else if (kpiType === "Skillset") {
        progressData.wording_score = wordingScore;
        progressData.tonality_score = tonalityScore;
        progressData.rapport_score = rapportScore;
        progressData.average_score = averageScore;
        console.log(`Adding scores for Skillset KPI with ID: ${kpiId}`);
      }

      // Add attachment if exists
      if (file) {
        progressData.attachment = file;
        console.log(`Adding attachment: ${file.name} (${file.size} bytes)`);
      }

      console.log(`Submitting ${kpiType} KPI progress for ${kpiName} (ID: ${kpiId}):`, { 
        ...progressData, 
        attachment: file ? `${file.name} (${file.size} bytes)` : null 
      });

      // Send the data to the API
      const result = await xanoService.addKPIProgress(progressData);
      console.log(`${kpiType} KPI progress added successfully. Response:`, result);
      
      // Log the fields that were successfully saved
      if (result) {
        console.log("Saved fields:", Object.keys(result));
        console.log("sales_id in response:", result.sales_id);
        console.log("week_id in response:", result.week_id);
        console.log("updated_at in response:", result.updated_at);
      }
      
      toast.success(`${kpiType} KPI progress added successfully`);
      onSubmit();
    } catch (error: any) {
      console.error(`Error submitting ${kpiType} KPI progress:`, error);
      
      // Provide more specific error messages based on the error
      let errorMessage = `Failed to add ${kpiType} KPI progress`;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.status === 400) {
          if (kpiType === "Action") {
            errorMessage = "Invalid data for Action KPI. Please check your inputs.";
            console.log("This might be due to incorrect field mapping for the Action KPI endpoint.");
            
            // Log the expected fields for Action KPI progress
            console.log("Expected fields for Action KPI progress: sales_id, kpi_id, week_id, date_added, count, remark, updated_at, mentor_edited");
            
            // Check if the error is related to specific fields
            if (error.response.data && error.response.data.message) {
              if (error.response.data.message.includes("sales_id")) {
                console.error("Issue with sales_id field. Current value:", userId);
                errorMessage = "Error with sales ID. Please try again or contact support.";
              } else if (error.response.data.message.includes("updated_at")) {
                console.error("Issue with updated_at field");
                errorMessage = "Error with timestamp. Please try again or contact support.";
              } else if (error.response.data.message.includes("week_id")) {
                console.error("Issue with week_id field. Current value:", weekId);
                errorMessage = "Error with week ID. Please try again or contact support.";
              }
            }
          } else {
            errorMessage = "Invalid data for Skillset KPI. Please check your inputs.";
          }
          
          // Check for specific error messages in the response
          if (error.response.data && error.response.data.message) {
            if (error.response.data.message.includes("path")) {
              errorMessage = "File upload error: Missing file path. Please try again or contact support.";
            } else if (error.response.data.message.includes("Missing param")) {
              const missingParam = error.response.data.message.split(":")[1]?.trim() || "unknown parameter";
              errorMessage = `Missing required field: ${missingParam}. Please contact support.`;
              console.error(`API expects field "${missingParam}" which might be missing in our request.`);
            } else {
              errorMessage = error.response.data.message;
            }
          } else if (error.response.data && typeof error.response.data === 'object') {
            // Try to extract error details from the response data
            const errorDetails = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            if (errorDetails) {
              errorMessage += ` (${errorDetails})`;
            }
          }
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "You are not authorized to perform this action.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 pb-6">
      {/* Date Selector */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* KPI Type */}
      <div className="space-y-2">
        <Label htmlFor="kpi-type">KPI Type</Label>
        <Select value={kpiType} onValueChange={(value) => {
          setKpiType(value as KPIType);
        }}>
          <SelectTrigger id="kpi-type">
            <SelectValue placeholder="Select KPI Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Action">Action</SelectItem>
            <SelectItem value="Skillset">Skillset</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* KPI Name */}
      {kpiType && (
        <div className="space-y-2">
          <Label htmlFor="kpi-name">KPI Name</Label>
          <Select 
            value={kpiName} 
            onValueChange={setKpiName}
            disabled={isLoadingKpis}
          >
            <SelectTrigger id="kpi-name">
              <SelectValue placeholder={isLoadingKpis ? "Loading KPIs..." : "Select KPI Name"} />
            </SelectTrigger>
            <SelectContent>
              {isLoadingKpis ? (
                <SelectItem value="loading" disabled>Loading KPIs...</SelectItem>
              ) : kpiType === "Action" ? (
                actionKPIs.length > 0 ? (
                  actionKPIs.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.kpi_name}>{kpi.kpi_name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-kpis" disabled>No Action KPIs available</SelectItem>
                )
              ) : (
                skillsetKPIs.length > 0 ? (
                  skillsetKPIs.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.kpi_name}>{kpi.kpi_name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-kpis" disabled>No Skillset KPIs available</SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {kpiId && <p className="text-xs text-muted-foreground mt-1">KPI ID: {kpiId}</p>}
        </div>
      )}
      
      {/* Action Count - Only shown for Action KPI type */}
      {kpiType === "Action" && kpiName && (
        <div className="space-y-2">
          <Label htmlFor="action-count">Action Count</Label>
          <Input
            id="action-count"
            type="number"
            min="1"
            placeholder="Enter the number of actions"
            value={actionCount || ""}
            onChange={(e) => setActionCount(parseInt(e.target.value) || 0)}
            className="w-full"
          />
        </div>
      )}
      
      {/* Skillset Scores - Only shown for Skillset KPI type */}
      {kpiType === "Skillset" && kpiName && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wording-score">Wording Score (0-100)</Label>
            <Input
              id="wording-score"
              type="number"
              min="0"
              max="100"
              placeholder="Enter score (0-100)"
              value={wordingScore || ""}
              onChange={(e) => handleScoreChange(e.target.value, setWordingScore)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tonality-score">Tonality Score (0-100)</Label>
            <Input
              id="tonality-score"
              type="number"
              min="0"
              max="100"
              placeholder="Enter score (0-100)"
              value={tonalityScore || ""}
              onChange={(e) => handleScoreChange(e.target.value, setTonalityScore)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rapport-score">Rapport Score (0-100)</Label>
            <Input
              id="rapport-score"
              type="number"
              min="0"
              max="100"
              placeholder="Enter score (0-100)"
              value={rapportScore || ""}
              onChange={(e) => handleScoreChange(e.target.value, setRapportScore)}
              className="w-full"
            />
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Average Score:</span>
              <span className="text-xl font-bold">{averageScore}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Remark */}
      <div className="space-y-2">
        <Label htmlFor="remark">Remark</Label>
        <Textarea
          id="remark"
          placeholder="Add any additional notes or remarks"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      {/* File Attachment */}
      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment (Optional)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="attachment"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("attachment")?.click()}
            className="flex items-center gap-2"
          >
            <PaperclipIcon size={16} />
            {file ? "Change Attachment" : "Add Attachment"}
          </Button>
          {file && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {file.name}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingKpis}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isLoadingKpis ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
} 