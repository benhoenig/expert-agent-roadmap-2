import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { codeOfHonorService, CodeOfHonor } from '@/services/codeOfHonorService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, XCircle } from 'lucide-react';

interface CodeOfHonorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  weekId: number; // The current week ID
  salesPersonId: number; // The salesperson ID
  codeOfHonors: CodeOfHonor[]; // All available codes of honor
  currentViolations: string[]; // Current code of honor violations
  onMarkViolation: (codeOfHonorId: number, isViolation: boolean, remark: string) => void;
  isLoading?: boolean; // Loading state from parent
}

interface CodeOfHonorState {
  id: number;
  text: string;
  isViolation: boolean;
}

export function CodeOfHonorModal({
  isOpen,
  onOpenChange,
  weekId,
  salesPersonId,
  codeOfHonors,
  currentViolations,
  onMarkViolation,
  isLoading: externalLoading = false
}: CodeOfHonorModalProps) {
  const { toast } = useToast();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCodeOfHonor, setSelectedCodeOfHonor] = useState<CodeOfHonorState | null>(null);
  const [remark, setRemark] = useState<string>('');

  // Combine external and local loading states
  const isLoading = externalLoading || isLocalLoading;

  // Initialize codes of honor with their current violation status
  const [codesOfHonor, setCodesOfHonor] = useState<CodeOfHonorState[]>([]);
  
  // Update codes of honor when props change
  useEffect(() => {
    if (codeOfHonors?.length) {
      setCodesOfHonor(
        codeOfHonors.map(coh => ({
          id: coh.id,
          // Get the appropriate text for this code of honor
          text: coh.code_of_honor_name || coh.code_of_honor_text || coh.name || '',
          isViolation: currentViolations.some(v => 
            v === (coh.code_of_honor_name || coh.code_of_honor_text || coh.name || '')
          )
        }))
      );
    }
  }, [codeOfHonors, currentViolations]);

  // Handle toggling a code of honor violation status
  const handleToggleViolation = (codeOfHonor: CodeOfHonorState) => {
    // If turning on a violation, show the confirmation dialog
    if (!codeOfHonor.isViolation) {
      setSelectedCodeOfHonor(codeOfHonor);
      setRemark('');
      setConfirmDialogOpen(true);
    } else {
      // If turning off a violation, toggle directly without confirmation
      updateCodeOfHonorStatus(codeOfHonor, false, '');
    }
  };

  // Confirm marking a code of honor violation
  const confirmMarkViolation = () => {
    if (!selectedCodeOfHonor) return;
    
    updateCodeOfHonorStatus(selectedCodeOfHonor, true, remark);
    setConfirmDialogOpen(false);
  };

  // Update the code of honor violation status
  const updateCodeOfHonorStatus = (
    codeOfHonor: CodeOfHonorState, 
    isViolation: boolean, 
    remarkText: string
  ) => {
    setIsLocalLoading(true);
    
    try {
      // Update the local state
      setCodesOfHonor(prevCodes => 
        prevCodes.map(code => 
          code.id === codeOfHonor.id 
            ? { ...code, isViolation } 
            : code
        )
      );
      
      // Call the parent callback to update the data
      onMarkViolation(codeOfHonor.id, isViolation, remarkText);
      
      toast({
        title: isViolation ? 'Violation Marked' : 'Violation Removed',
        description: `"${codeOfHonor.text}" has been ${isViolation ? 'marked as a violation' : 'unmarked'}${isViolation && remarkText ? ' with remarks added to mentor notes' : ''}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update violation status',
        variant: 'destructive',
      });
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Code of Honor</DialogTitle>
            <DialogDescription>
              Manage code of honor violations for this sales person. Toggle the switch to mark or unmark violations.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {codesOfHonor.map((coh) => (
                  <div 
                    key={coh.id} 
                    className="flex items-center justify-between py-2 border-b border-border"
                  >
                    <div className="flex items-center space-x-2">
                      {coh.isViolation && (
                        <XCircle size={16} className="text-red-600 flex-shrink-0" />
                      )}
                      <span className={`font-medium ${coh.isViolation ? 'text-red-600' : ''}`}>
                        {coh.text}
                      </span>
                    </div>
                    <Switch
                      checked={coh.isViolation}
                      onCheckedChange={() => handleToggleViolation(coh)}
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog for marking a violation */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Code of Honor Violation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to mark "{selectedCodeOfHonor?.text}" as violated.
              Please add a remark that will be added to the mentor notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-2">
            <Label htmlFor="remark">Remark:</Label>
            <Textarea
              id="remark"
              placeholder="Enter your remark about this violation..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkViolation}
              disabled={isLoading || !remark.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Submitting...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 