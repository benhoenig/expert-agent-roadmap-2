import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Bug, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSalesAssignments } from "@/hooks/useSalesAssignments";
import { formatDate } from "@/types/salesAssignment";
import { MentorAssignmentModal } from "@/components/dashboard/MentorAssignmentModal";

export default function MentorAssignment() {
  // Use our custom hook to get all sales data
  const {
    allSales,
    allMentors,
    getMentorName,
    isLoading,
    loadAllSales
  } = useSalesAssignments();
  
  // State for assignment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<{
    id: number;
    name: string;
    mentor_id: number | null;
  } | null>(null);

  // Debug function to log mentors and sales
  const debugMentorAssignments = () => {
    console.log("All Sales with mentor_id:", allSales.map(sale => ({
      id: sale.id,
      name: sale.display_name,
      mentor_id: sale.mentor_id
    })));
    console.log("Available Mentors:", allMentors);
    
    toast({
      title: "Debug Info",
      description: "Check the console for mentor assignment debug info",
    });
  };
  
  // Handle opening the assignment modal for a sales user
  const handleOpenAssignmentModal = (sale: any) => {
    setSelectedSale({
      id: sale.id,
      name: sale.display_name,
      mentor_id: sale.mentor_id
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mentor Sales Assignment</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={debugMentorAssignments}
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadAllSales}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Agents</CardTitle>
          <CardDescription>
            Overview of all sales agents and their assigned mentors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Agent</TableHead>
                    <TableHead>Assigned Mentor</TableHead>
                    <TableHead>Starting Date</TableHead>
                    <TableHead>Generation</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Probation Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Loading sales data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : allSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No sales agents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allSales.map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.display_name}</TableCell>
                        <TableCell>{getMentorName(sale.mentor_id)}</TableCell>
                        <TableCell>{formatDate(sale.starting_date)}</TableCell>
                        <TableCell>{sale.generation}</TableCell>
                        <TableCell>{sale.property_type}</TableCell>
                        <TableCell>{sale.probation_status}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAssignmentModal(sale)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Modal */}
      {selectedSale && (
        <MentorAssignmentModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          salesId={selectedSale.id}
          salesName={selectedSale.name}
          currentMentorId={selectedSale.mentor_id}
          onSuccess={loadAllSales}
        />
      )}
    </div>
  );
} 