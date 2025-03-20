import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CodeOfHonorModal } from './CodeOfHonorModal';
import { codeOfHonorService } from '@/services/codeOfHonorService';
import { useToast } from '@/components/ui/use-toast';
import { 
  KpiAction, 
  KpiSkillset, 
  RequirementItem, 
  RequirementCount, 
  CodeOfHonorStatus as CodeOfHonor, 
  MentorNote, 
  WeekData 
} from '@/services/api';

interface SalesCardProps {
  id: number;
  salesId?: number; // Optional - if different from id
  orderNumber?: number;
  profileImage?: string;
  name: string;
  currentRank: string;
  weeksPassed: number;
  target100PercentWeeks: number;
  targetFailedWeeks: number;
  cohWarnings: number;
  weekData: WeekData[];
  onClick?: () => void;
}

export function SalesCard({
  id,
  salesId,
  orderNumber,
  profileImage,
  name,
  currentRank,
  weeksPassed,
  target100PercentWeeks,
  targetFailedWeeks,
  cohWarnings,
  weekData,
  onClick
}: SalesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [newNoteText, setNewNoteText] = useState('');
  const [isCodeOfHonorModalOpen, setIsCodeOfHonorModalOpen] = useState(false);
  const [allCodeOfHonors, setAllCodeOfHonors] = useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const { toast } = useToast();
  
  // Get initials for avatar fallback
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
  
  // Handle expand/collapse
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  // Navigate between weeks
  const previousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
      setNewNoteText('');
    }
  };
  
  const nextWeek = () => {
    if (currentWeekIndex < weekData.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
      setNewNoteText('');
    }
  };
  
  // Get current week data
  const currentWeekData = weekData[currentWeekIndex] || {
    weekNumber: 1,
    actions: [],
    skillsets: [],
    requirements: [],
    requirementCounts: [],
    codeOfHonors: [],
    mentorNotes: []
  };
  
  // Handle new note text change
  const handleNoteTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNoteText(e.target.value);
  };
  
  // Add new note
  const addNote = () => {
    if (newNoteText.trim()) {
      // In a real implementation, this would call an API to save the note
      // For this example, we're just simulating adding to local state
      const newNote: MentorNote = {
        id: Date.now().toString(),
        text: newNoteText,
        createdAt: new Date(),
        createdBy: "Current Mentor" // Would come from auth context in real app
      };
      
      // This is just for demonstration - in a real app you'd update via API
      currentWeekData.mentorNotes = [...currentWeekData.mentorNotes, newNote];
      
      // Clear the input
      setNewNoteText('');
    }
  };
  
  // Format date to display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fetch all codes of honor when needed
  useEffect(() => {
    if (isCodeOfHonorModalOpen && allCodeOfHonors.length === 0) {
      fetchAllCodeOfHonors();
    }
  }, [isCodeOfHonorModalOpen]);

  // Fetch all codes of honor
  const fetchAllCodeOfHonors = async () => {
    setIsLoadingCodes(true);
    try {
      const codesOfHonor = await codeOfHonorService.getAllCodeOfHonors();
      setAllCodeOfHonors(codesOfHonor);
    } catch (error) {
      console.error('Error fetching codes of honor:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Code of Honor data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCodes(false);
    }
  };

  // Handle marking a code of honor violation
  const handleMarkViolation = (codeOfHonorId: number, isViolation: boolean, remark: string) => {
    // Find the code of honor
    const codeOfHonor = allCodeOfHonors.find(coh => coh.id === codeOfHonorId);
    
    if (!codeOfHonor) return;
    
    // Get the text of the code of honor
    const codeText = codeOfHonor.code_of_honor_name || codeOfHonor.code_of_honor_text || codeOfHonor.name || '';
    
    // Update the current week data
    const updatedCodeOfHonors = [...currentWeekData.codeOfHonors];
    
    if (isViolation) {
      // Add to violations if not already present
      if (!updatedCodeOfHonors.some(coh => coh.name === codeText)) {
        updatedCodeOfHonors.push({
          name: codeText,
          hasWarning: true
        });
      }
      
      // Add a note with the remark
      if (remark) {
        const newNote = {
          id: Date.now().toString(),
          text: `[COH Violation] ${codeText}: ${remark}`,
          createdAt: new Date(),
          createdBy: "Current Mentor" // Would come from auth context in real app
        };
        
        currentWeekData.mentorNotes = [...currentWeekData.mentorNotes, newNote];
      }
    } else {
      // Remove from violations
      const index = updatedCodeOfHonors.findIndex(coh => 
        coh.name === codeText && coh.hasWarning
      );
      
      if (index !== -1) {
        updatedCodeOfHonors.splice(index, 1);
      }
    }
    
    // Update the current week data
    currentWeekData.codeOfHonors = updatedCodeOfHonors;
    
    // Force a re-render
    setCurrentWeekIndex(currentWeekIndex);
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${isExpanded ? 'col-span-full' : ''}`}>
      <CardContent className="p-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
              #{orderNumber}
            </div>
            
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={profileImage} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium truncate">{name}</p>
                <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                  {currentRank}
                </Badge>
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleExpand}
            className="ml-2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Week 100%:</span>
          <span className="font-medium text-green-600">{target100PercentWeeks}</span>
        </div>
        <div className="flex justify-between">
          <span>Week Failed:</span>
          <span className="font-medium text-red-600">{targetFailedWeeks}</span>
        </div>
        <div className="flex justify-between">
          <span>COH Warning:</span>
          <span className={`font-medium ${cohWarnings > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {cohWarnings}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Week Passed:</span>
          <span className="font-medium">{weeksPassed}/12</span>
        </div>
      </CardFooter>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <Separator />
          
          {/* Section 1: Week selector */}
          <div className="flex items-center justify-center space-x-3 py-1">
            <button
              onClick={previousWeek}
              disabled={currentWeekIndex === 0}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous week"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-medium text-sm">Week {currentWeekData.weekNumber}</span>
            <button
              onClick={nextWeek}
              disabled={currentWeekIndex === weekData.length - 1}
              className="p-1 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next week"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          
          {/* Section 2: KPI */}
          <div>
            <h4 className="text-xs font-medium mb-1">KPI</h4>
            
            {/* Actions */}
            <div className="mb-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-1">
                <div className="col-span-3">Action</div>
                <div className="col-span-5">Progress</div>
                <div className="col-span-2 text-center">Done</div>
                <div className="col-span-2 text-center">Target</div>
              </div>
              
              {currentWeekData.actions.map((action, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 text-xs items-center mb-1">
                  <div className="col-span-3 truncate">{action.name}</div>
                  <div className="col-span-5">
                    <Progress value={action.progress} className="h-1.5" />
                  </div>
                  <div className="col-span-2 text-center font-medium">{action.done}</div>
                  <div className="col-span-2 text-center text-muted-foreground">{action.target}</div>
                </div>
              ))}
            </div>
            
            {/* Skillsets */}
            <div>
              <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground mb-1">
                <div className="col-span-1">Skillset</div>
                <div className="col-span-1 text-center">Wording</div>
                <div className="col-span-1 text-center">Tonality</div>
                <div className="col-span-1 text-center">Rapport</div>
                <div className="col-span-1 text-center">Total</div>
              </div>
              
              {currentWeekData.skillsets.map((skillset, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 text-xs mb-1">
                  <div className="col-span-1 truncate">{skillset.name}</div>
                  <div className="col-span-1 text-center font-medium">{skillset.wording}</div>
                  <div className="col-span-1 text-center font-medium">{skillset.tonality}</div>
                  <div className="col-span-1 text-center font-medium">{skillset.rapport}</div>
                  <div className="col-span-1 text-center font-medium">{skillset.total}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section 3: Requirements */}
          <div>
            <h4 className="text-xs font-medium mb-1">Requirements</h4>
            <div className="space-y-1">
              {currentWeekData.requirementCounts.map((req, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <div className="truncate pr-2">{req.name}</div>
                  <div className="font-medium">{req.count}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section 4: Code of Honor */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-medium">Code of Honor</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setIsCodeOfHonorModalOpen(true)}
              >
                Manage
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {currentWeekData.codeOfHonors.some(coh => coh.hasWarning) ? (
                // Show violations if any exist
                currentWeekData.codeOfHonors.filter(coh => coh.hasWarning).map((coh, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="mr-1 text-base">
                      <XCircle size={14} className="text-red-600" />
                    </div>
                    <div className="truncate text-red-600">
                      {coh.name}
                    </div>
                  </div>
                ))
              ) : (
                // Show single "Passed!" message if no violations
                <div className="flex items-center text-xs">
                  <div className="mr-1 text-base">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <div className="text-green-600 font-medium">
                    Passed!
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Section 5: Mentor Notes */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-medium">Mentor Notes</h4>
              <span className="text-xs text-muted-foreground">
                {currentWeekData.mentorNotes.length} note(s)
              </span>
            </div>
            
            {/* Existing notes list */}
            {currentWeekData.mentorNotes.length > 0 ? (
              <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                {currentWeekData.mentorNotes.map((note) => (
                  <div key={note.id} className="bg-muted/50 p-2 rounded-md text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-primary">{note.createdBy}</span>
                      <div className="flex items-center text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <p className="mt-1">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mb-2">No notes yet</div>
            )}
            
            {/* Add new note */}
            <Textarea 
              placeholder="Add a new note..."
              className="text-xs" 
              rows={2}
              value={newNoteText}
              onChange={handleNoteTextChange}
            />
            <div className="flex justify-end mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2"
                onClick={addNote}
                disabled={!newNoteText.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Code of Honor Modal */}
      <CodeOfHonorModal
        isOpen={isCodeOfHonorModalOpen}
        onOpenChange={setIsCodeOfHonorModalOpen}
        weekId={currentWeekData.weekNumber}
        salesPersonId={id}
        codeOfHonors={allCodeOfHonors}
        currentViolations={currentWeekData.codeOfHonors
          .filter(coh => coh.hasWarning)
          .map(coh => coh.name)
        }
        onMarkViolation={handleMarkViolation}
        isLoading={isLoadingCodes}
      />
    </Card>
  );
} 