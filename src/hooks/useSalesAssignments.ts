import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { salesService } from '@/services/api/salesService';
import { SalesAssignment } from '@/types/salesAssignment';

export function useSalesAssignments() {
  const [allSales, setAllSales] = useState<SalesAssignment[]>([]);
  const [allMentors, setAllMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all sales users
  const loadAllSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all sales users
      const salesUsers = await salesService.getSalesUsers();
      
      if (!salesUsers || !Array.isArray(salesUsers)) {
        console.warn('[useSalesAssignments] Invalid sales data returned from API');
        setAllSales([]);
        return;
      }
      
      // Also fetch all mentors to be able to display mentor names
      try {
        const mentorUsers = await salesService.getMentors();
        setAllMentors(mentorUsers);
      } catch (mentorError) {
        console.error('[useSalesAssignments] Error loading mentors:', mentorError);
      }
      
      // Map sales users to SalesAssignment format
      const assignments: SalesAssignment[] = salesUsers.map(sale => ({
        id: sale.id,
        user_id: sale.user_id,
        mentor_id: sale.mentor_id,
        display_name: sale.display_name || '',
        starting_date: sale.starting_date,
        generation: sale.generation,
        property_type: sale.property_type,
        probation_status: sale.probation_status,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        user: sale.user
      }));
      
      setAllSales(assignments);
      
    } catch (error) {
      console.error('[useSalesAssignments] Error loading sales:', error);
      setError(error instanceof Error ? error : new Error('Failed to load sales'));
      toast({
        title: "Error",
        description: "Failed to load sales data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get mentor name for a given mentor_id
  const getMentorName = useCallback((mentorId: number | null | undefined): string => {
    if (!mentorId) return 'Unassigned';
    
    // Find the mentor with this ID
    const mentor = allMentors.find(m => m.id === mentorId);
    
    // Return mentor name if found, otherwise fallback to ID
    return mentor 
      ? mentor.name || mentor.full_name || mentor.username || `Mentor ${mentorId}`
      : `Mentor ${mentorId}`;
  }, [allMentors]);

  // Load sales on mount
  useEffect(() => {
    loadAllSales();
  }, [loadAllSales]);

  return {
    allSales,
    allMentors,
    getMentorName,
    isLoading,
    error,
    loadAllSales
  };
} 