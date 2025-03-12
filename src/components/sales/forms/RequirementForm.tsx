import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RequirementFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

type RequirementType = "Training Attended" | "HOME Academy Video Watched" | "Real Case with Senior";

export function RequirementForm({ onCancel, onSubmit }: RequirementFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [requirementType, setRequirementType] = useState<RequirementType | "">("");
  const [trainingName, setTrainingName] = useState<string>("");
  const [lessonName, setLessonName] = useState<string>("");
  const [seniorName, setSeniorName] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const [lessonLearned, setLessonLearned] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo training names
  const trainingOptions = [
    "Basic Sales Training",
    "Advanced Negotiation Techniques",
    "Customer Relationship Management"
  ];

  // Case type options
  const caseTypeOptions = ["Owner Visit", "Survey", "Showing"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !requirementType) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate fields based on requirement type
    if (requirementType === "Training Attended" && !trainingName) {
      toast.error("Please select a training name");
      return;
    } else if (requirementType === "HOME Academy Video Watched" && !lessonName) {
      toast.error("Please enter a lesson name");
      return;
    } else if (requirementType === "Real Case with Senior" && (!seniorName || !caseType)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!lessonLearned) {
      toast.error("Please enter what you learned");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is where we would normally send the data to the API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Requirement progress added successfully");
      onSubmit();
    } catch (error) {
      console.error("Error submitting requirement progress:", error);
      toast.error("Failed to add requirement progress");
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
      
      {/* Requirement Type */}
      <div className="space-y-2">
        <Label htmlFor="requirement-type">Requirement Type</Label>
        <Select 
          value={requirementType} 
          onValueChange={(value) => {
            setRequirementType(value as RequirementType);
            // Reset specific fields when type changes
            setTrainingName("");
            setLessonName("");
            setSeniorName("");
            setCaseType("");
            setLessonLearned("");
          }}
        >
          <SelectTrigger id="requirement-type">
            <SelectValue placeholder="Select Requirement Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Training Attended">Training Attended</SelectItem>
            <SelectItem value="HOME Academy Video Watched">HOME Academy Video Watched</SelectItem>
            <SelectItem value="Real Case with Senior">Real Case with Senior</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Conditional fields based on requirement type */}
      {requirementType === "Training Attended" && (
        <div className="space-y-2">
          <Label htmlFor="training-name">Training Name</Label>
          <Select value={trainingName} onValueChange={setTrainingName}>
            <SelectTrigger id="training-name">
              <SelectValue placeholder="Select Training" />
            </SelectTrigger>
            <SelectContent>
              {trainingOptions.map((training) => (
                <SelectItem key={training} value={training}>{training}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {requirementType === "HOME Academy Video Watched" && (
        <div className="space-y-2">
          <Label htmlFor="lesson-name">Lesson Name</Label>
          <Input
            id="lesson-name"
            placeholder="Enter the lesson name"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
          />
        </div>
      )}
      
      {requirementType === "Real Case with Senior" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="senior-name">Senior Name</Label>
            <Input
              id="senior-name"
              placeholder="Enter the senior's name"
              value={seniorName}
              onChange={(e) => setSeniorName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="case-type">Case Type</Label>
            <Select value={caseType} onValueChange={setCaseType}>
              <SelectTrigger id="case-type">
                <SelectValue placeholder="Select Case Type" />
              </SelectTrigger>
              <SelectContent>
                {caseTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {/* Lesson Learned - shown for all requirement types */}
      {requirementType && (
        <div className="space-y-2">
          <Label htmlFor="lesson-learned">Lesson Learned</Label>
          <Textarea
            id="lesson-learned"
            placeholder="What did you learn from this experience?"
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      )}
      
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