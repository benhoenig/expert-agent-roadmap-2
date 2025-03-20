import { useState, useEffect } from 'react';
import { makeApiRequest } from '../services/api/xanoClient';

// Mock user object for development - without arbitrary mentor_id
const MOCK_USER = {
  id: 1, // This is the user_id
  username: 'mentor_user',
  full_name: 'Demo Mentor',
  nickname: 'Demo',
  role: 'Mentor',
  user_status: 'active'
};

// Mock auth token for development
const DEV_AUTH_TOKEN = 'dev_mock_token_for_testing_12345';

/**
 * Auth hook for handling user authentication
 * In development mode, it provides a mock user
 */
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch the mentor record for a user
  const fetchMentorRecord = async (userId: number) => {
    try {
      console.log(`[Auth] Fetching mentor record for user ID ${userId}`);
      
      // Query the mentor table to find the mentor record with this user_id
      const mentorRecords = await makeApiRequest('get', '/mentor', { 
        user_id: userId 
      });
      
      if (Array.isArray(mentorRecords) && mentorRecords.length > 0) {
        const mentorRecord = mentorRecords[0];
        console.log(`[Auth] Found mentor record:`, mentorRecord);
        
        // Return the mentor ID from the mentor table
        return {
          mentor_id: mentorRecord.id
        };
      } else {
        console.warn(`[Auth] No mentor record found for user ID ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('[Auth] Error fetching mentor record:', error);
      return null;
    }
  };
  
  useEffect(() => {
    // In a real app, this would check for a valid token and fetch user data
    const checkAuth = async () => {
      try {
        // Check if we already have a token in storage
        const existingToken = localStorage.getItem('xano_token') || sessionStorage.getItem('xano_token');
        
        // For development, if no token exists, set a mock token
        if (!existingToken && process.env.NODE_ENV === 'development') {
          console.log('[Auth] Setting mock token for development');
          localStorage.setItem('xano_token', DEV_AUTH_TOKEN);
          
          // For development, get the mentor record for the mock user
          if (MOCK_USER.role === 'Mentor') {
            const mentorInfo = await fetchMentorRecord(MOCK_USER.id);
            if (mentorInfo) {
              // Combine the user data with the mentor info
              setUser({ ...MOCK_USER, ...mentorInfo });
            } else {
              setUser(MOCK_USER);
            }
          } else {
            setUser(MOCK_USER);
          }
        } else if (existingToken) {
          // In production, this would fetch user data from the API
          // For now, use mock user with a mentor lookup
          if (MOCK_USER.role === 'Mentor') {
            const mentorInfo = await fetchMentorRecord(MOCK_USER.id);
            if (mentorInfo) {
              // Combine the user data with the mentor info
              setUser({ ...MOCK_USER, ...mentorInfo });
            } else {
              setUser(MOCK_USER);
            }
          } else {
            setUser(MOCK_USER);
          }
        }
      } catch (error) {
        console.error('[Auth] Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials: { username: string; password: string }) => {
    // Mock implementation - in real app, this would call the API
    localStorage.setItem('xano_token', DEV_AUTH_TOKEN);
    
    // For mentor users, fetch their mentor record
    if (MOCK_USER.role === 'Mentor') {
      const mentorInfo = await fetchMentorRecord(MOCK_USER.id);
      if (mentorInfo) {
        const userWithMentorId = { ...MOCK_USER, ...mentorInfo };
        setUser(userWithMentorId);
        return userWithMentorId;
      }
    }
    
    setUser(MOCK_USER);
    return MOCK_USER;
  };
  
  const logout = () => {
    localStorage.removeItem('xano_token');
    sessionStorage.removeItem('xano_token');
    setUser(null);
  };
  
  return { user, isLoading, login, logout };
}; 