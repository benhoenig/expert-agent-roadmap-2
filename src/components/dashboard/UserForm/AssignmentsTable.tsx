import React from 'react';
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { SalesAssignment } from '../../../types/salesAssignment';

interface AssignmentsTableProps {
  assignedSales: SalesAssignment[];
  showInactive: boolean;
  setShowInactive: React.Dispatch<React.SetStateAction<boolean>>;
  formatDate: (dateString: string) => string;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  assignedSales,
  showInactive,
  setShowInactive,
  formatDate
}) => {
  return (
    <div className="border rounded-md mt-4">
      <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
        <h4 className="text-sm font-medium">Current Sales Assignments</h4>
        {assignedSales.some(a => !a.active) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInactive(!showInactive)}
            className="text-xs h-7 px-2"
          >
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>
        )}
      </div>
      
      {assignedSales.filter(a => a.active || showInactive).length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Sales Agent</TableHead>
              <TableHead className="w-[120px]">Assigned Date</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedSales
              .filter(a => a.active || showInactive)
              .map((assignment) => (
                <TableRow key={assignment.id} className={!assignment.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {assignment.sales_name}
                  </TableCell>
                  <TableCell>
                    {formatDate(assignment.assigned_date)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={assignment.active ? "default" : "secondary"} 
                      className={assignment.active ? "bg-green-100 text-green-800" : ""}
                    >
                      {assignment.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-6 text-center text-muted-foreground">
          <p>No sales agents are currently assigned to this mentor.</p>
          <p className="text-sm mt-1">Use the dropdown above to assign sales agents.</p>
        </div>
      )}
    </div>
  );
}; 