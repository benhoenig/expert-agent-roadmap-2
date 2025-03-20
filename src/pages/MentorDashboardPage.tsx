import React from 'react';
import { MentorDashboard } from '@/components/mentor/MentorDashboard';
import { useAuth } from '../hooks/useAuth';

export function MentorDashboardPage() {
  const { user } = useAuth(); // Get the logged in user
  
  // If the user has a mentor_id property, use that
  // Otherwise fall back to a default ID (1) for development/demo
  const mentorId = user?.mentor_id || 1;
  
  console.log('[MentorDashboardPage] Using mentor ID:', mentorId);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Sales Team</h1>
      <MentorDashboard mentorId={mentorId} />
    </div>
  );
}

export default MentorDashboardPage; 