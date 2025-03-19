// Define interface for sales assignment
export interface SalesAssignment {
  id: number;
  user_id: number;
  mentor_id?: number | null;
  display_name: string;
  starting_date: string;
  generation: number;
  property_type: string;
  probation_status: string;
  probation_extended?: boolean;
  probation_remark?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
    nickname?: string;
    role: string;
    user_status: string;
  };
}

// Helper function to format dates for display
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 