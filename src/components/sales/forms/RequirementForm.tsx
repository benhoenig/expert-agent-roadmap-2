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

interface RequirementFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

type RequirementType = "Training Attended" | "HOME Academy Video Watched" | "Real Case with Senior";

// Define requirement IDs for each type
const REQUIREMENT_IDS = {
  "Training Attended": 1,
  "HOME Academy Video Watched": 2,
  "Real Case with Senior": 3
};

export function RequirementForm({ onCancel, onSubmit }: RequirementFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [requirementType, setRequirementType] = useState<RequirementType | "">("");
  const [trainingName, setTrainingName] = useState<string>("");
  const [lessonName, setLessonName] = useState<string>("");
  const [seniorName, setSeniorName] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const [lessonLearned, setLessonLearned] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [weekId, setWeekId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo training names
  const trainingOptions = [
    "Basic Sales Training",
    "Advanced Negotiation Techniques",
    "Customer Relationship Management"
  ];

  // Case type options
  const caseTypeOptions = ["Owner Visit", "Survey", "Showing"];

  // Fetch user data and current week on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data
        const userData = await xanoService.getUserData();
        console.log("User data fetched:", userData);
        
        if (userData && userData.id) {
          setUserId(userData.id);
        } else {
          console.warn("User data fetched but no ID found:", userData);
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
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load user data. Some features may be limited.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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

    if (!userId) {
      toast.error("User data not available. Please try again or contact support.");
      return;
    }

    if (!weekId) {
      toast.error("Week data not available. Please try again or contact support.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the requirement progress data
      const requirementData: any = {
        user_id: userId,
        week_id: weekId,
        requirement_id: REQUIREMENT_IDS[requirementType as RequirementType],
        date_added: date instanceof Date ? format(date, "yyyy-MM-dd") : date,
        count: 1, // Default count is 1 for requirements
        lesson_learned: lessonLearned,
        updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        mentor_edited: 0
      };

      // Add type-specific fields
      if (requirementType === "Training Attended") {
        requirementData.training_name = trainingName;
      } else if (requirementType === "HOME Academy Video Watched") {
        requirementData.lesson_name = lessonName;
      } else if (requirementType === "Real Case with Senior") {
        requirementData.senior_name = seniorName;
        requirementData.case_type = caseType;
      }

      // Add attachment if exists
      if (file) {
        requirementData.attachment = file;
      }

      console.log("Submitting requirement progress:", requirementData);

      // Send the data to the API
      const result = await xanoService.addRequirementProgress(requirementData);
      console.log("Requirement progress added successfully. Response:", result);
      
      toast.success("Requirement progress added successfully");
      onSubmit();
    } catch (error: any) {
      console.error("Error submitting requirement progress:", error);
      
      // Provide more specific error messages based on the error
      let errorMessage = "Failed to add requirement progress";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data. Please check your inputs.";
          
          // Check for specific error messages in the response
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "You are not authorized to perform this action.";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
      } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
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
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setCalendarOpen(false);
              }}
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
          <Input
            id="training-name"
            placeholder="Enter the training name"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
          />
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
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isLoading ? (
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