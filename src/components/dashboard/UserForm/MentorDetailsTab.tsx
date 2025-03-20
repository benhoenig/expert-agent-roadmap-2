import React from 'react';
import { TabsContent } from "../../ui/tabs";
import { SalesAgentSelector } from './SalesAgentSelector';
import { AssignmentsTable } from './AssignmentsTable';
import { SalesAssignment } from '../../../types/salesAssignment';

interface MentorDetailsTabProps {
  availableSales: { id: number; name: string }[];
  assignedSales: SalesAssignment[];
  selectedSalesIds: number[];
  toggleSalesSelection: (salesId: number, salesName: string) => void;
  multiSelectOpen: boolean;
  setMultiSelectOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showInactive: boolean;
  setShowInactive: React.Dispatch<React.SetStateAction<boolean>>;
  formatDate: (dateString: string) => string;
}

export const MentorDetailsTab: React.FC<MentorDetailsTabProps> = ({
  availableSales,
  assignedSales,
  selectedSalesIds,
  toggleSalesSelection,
  multiSelectOpen,
  setMultiSelectOpen,
  showInactive,
  setShowInactive,
  formatDate
}) => {
  return (
    <TabsContent value="mentor" className="space-y-4 pt-4">
      <div className="p-4 border rounded-md bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Assign multiple sales agents to this mentor using the multi-select dropdown below.
        </p>
      </div>
      
      {/* Multi-select Sales Agent Assignment Section */}
      <div className="space-y-3">
        <SalesAgentSelector
          availableSales={availableSales}
          selectedSalesIds={selectedSalesIds}
          toggleSalesSelection={toggleSalesSelection}
          multiSelectOpen={multiSelectOpen}
          setMultiSelectOpen={setMultiSelectOpen}
        />
        
        {/* Current Assignments Display */}
        <AssignmentsTable
          assignedSales={assignedSales}
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          formatDate={formatDate}
        />
      </div>
    </TabsContent>
  );
}; 