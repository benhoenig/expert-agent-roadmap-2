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

interface KPIFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

type KPIType = "Action" | "Skillset";

export function KPIForm({ onCancel, onSubmit }: KPIFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [kpiType, setKpiType] = useState<KPIType | "">("");
  const [kpiName, setKpiName] = useState<string>("");
  const [actionCount, setActionCount] = useState<number>(0);
  const [wordingScore, setWordingScore] = useState<number>(0);
  const [tonalityScore, setTonalityScore] = useState<number>(0);
  const [rapportScore, setRapportScore] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionKPIs = ["New List", "Consult", "Owner Visit"];
  const skillsetKPIs = ["Basic Script", "Consulting Script", "Buyer Script"];

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
      // This is where we would normally send the data to the API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("KPI progress added successfully");
      onSubmit();
    } catch (error) {
      console.error("Error submitting KPI progress:", error);
      toast.error("Failed to add KPI progress");
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
          setKpiName(""); // Reset KPI name when type changes
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
          <Select value={kpiName} onValueChange={setKpiName}>
            <SelectTrigger id="kpi-name">
              <SelectValue placeholder="Select KPI Name" />
            </SelectTrigger>
            <SelectContent>
              {kpiType === "Action" ? (
                actionKPIs.map((kpi) => (
                  <SelectItem key={kpi} value={kpi}>{kpi}</SelectItem>
                ))
              ) : (
                skillsetKPIs.map((kpi) => (
                  <SelectItem key={kpi} value={kpi}>{kpi}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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
        <div className="flex items-center gap-2">
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
            {file ? file.name : "Add Attachment"}
          </Button>
          {file && (
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {file.name}
            </span>
          )}
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
} 