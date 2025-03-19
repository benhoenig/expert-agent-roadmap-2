import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { salesService } from '@/services/api/salesService';

interface MentorAssignmentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  salesId: number | null;
  salesName: string;
  currentMentorId: number | null;
  onSuccess: () => void;
}

export function MentorAssignmentModal({
  isOpen,
  onOpenChange,
  salesId,
  salesName,
  currentMentorId,
  onSuccess
}: MentorAssignmentModalProps) {
  // State for mentor selection and loading state
  const [selectedMentorId, setSelectedMentorId] = useState<string | undefined>(
    currentMentorId ? String(currentMentorId) : undefined
  );
  const [mentors, setMentors] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load mentors when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMentors();
      // Initialize the selected mentor to the current one
      setSelectedMentorId(currentMentorId ? String(currentMentorId) : undefined);
    }
  }, [isOpen, currentMentorId]);

  // Load mentors for the dropdown
  const loadMentors = async () => {
    setIsLoading(true);
    try {
      const mentorsList = await salesService.getMentors();
      setMentors(mentorsList);
    } catch (error) {
      console.error('Error loading mentors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mentor assignment
  const handleAssignMentor = async () => {
    if (!salesId) return;
    
    setIsSaving(true);
    try {
      // Convert to number or null
      const mentorIdToAssign = selectedMentorId 
        ? parseInt(selectedMentorId, 10) 
        : null;
      
      await salesService.updateMentorAssignment(salesId, mentorIdToAssign);
      
      toast({
        title: 'Success',
        description: mentorIdToAssign 
          ? `Assigned mentor to ${salesName}` 
          : `Removed mentor from ${salesName}`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update mentor assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Mentor</DialogTitle>
          <DialogDescription>
            {salesName ? `Assign a mentor to ${salesName}` : 'Select a mentor for this sales agent'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mentor" className="text-right">
              Mentor
            </Label>
            <div className="col-span-3">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading mentors...</span>
                </div>
              ) : (
                <Select
                  value={selectedMentorId}
                  onValueChange={setSelectedMentorId}
                  disabled={isSaving}
                >
                  <SelectTrigger id="mentor">
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Mentor (Unassign)</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={String(mentor.id)}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleAssignMentor} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 