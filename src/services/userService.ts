import { xanoService } from './xanoService';

// Xano API configuration - adding this to match the xanoService.ts file
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Helper function to get the token from storage
const getAuthToken = () => {
  // Check localStorage first, then sessionStorage
  const token = localStorage.getItem("xano_token") || sessionStorage.getItem("xano_token") || null;
  return token;
};

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  nickname: string;
  role: 'Admin' | 'Mentor' | 'Sales';
  user_status: 'Active' | 'Warning' | 'Terminate' | 'Quit';
  created_at: string;
  updated_at: string;
}

export interface SalesProfile {
  id: number;
  user_id: number;
  starting_date: string;
  generation: number;
  property_type: 'House' | 'Condo';
  probation_status: 'Ongoing' | 'Passed' | 'Failed';
  probation_extended: boolean;
  probation_remark?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorProfile {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfiles extends User {
  sales_profile?: SalesProfile;
  mentor_profile?: MentorProfile;
}

// Request Types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  nickname: string;
  role: 'Admin' | 'Mentor' | 'Sales';
  user_status: 'Active' | 'Warning' | 'Terminate' | 'Quit';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  full_name?: string;
  nickname?: string;
  role?: 'Admin' | 'Mentor' | 'Sales';
  user_status?: 'Active' | 'Warning' | 'Terminate' | 'Quit';
}

export interface CreateSalesProfileRequest {
  user_id: number;
  starting_date: string;
  generation: number;
  property_type: 'House' | 'Condo';
  probation_status: 'Ongoing' | 'Passed' | 'Failed';
  probation_extended: boolean;
  probation_remark?: string;
}

export interface UpdateSalesProfileRequest {
  starting_date?: string;
  generation?: number;
  property_type?: 'House' | 'Condo';
  probation_status?: 'Ongoing' | 'Passed' | 'Failed';
  probation_extended?: boolean;
  probation_remark?: string;
}

export interface CreateMentorProfileRequest {
  user_id: number;
}

// Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

// User Service Functions
export const userService = {
  // Get all users - using the correct endpoint from the Xano API
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch users: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID - using the correct endpoint from the Xano API
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch user: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user - using the correct endpoint from the Xano API
  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create user: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update an existing user - using the correct endpoint from the Xano API
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update user: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user - using the correct endpoint from the Xano API
  deleteUser: async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete user: ${error.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Check if a username already exists
  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/user/check-username?username=${username}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to check username: ${error.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error(`Error checking if username ${username} exists:`, error);
      throw error;
    }
  },

  // Create a sales profile for a user - using the correct endpoint from the Xano API
  createSalesProfile: async (profileData: CreateSalesProfileRequest): Promise<SalesProfile> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create sales profile: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating sales profile:', error);
      throw error;
    }
  },

  // Update a sales profile - using the correct endpoint from the Xano API
  updateSalesProfile: async (profileId: number, profileData: UpdateSalesProfileRequest): Promise<SalesProfile> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/sales/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update sales profile: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating sales profile ${profileId}:`, error);
      throw error;
    }
  },

  // Create a mentor profile for a user
  createMentorProfile: async (profileData: CreateMentorProfileRequest): Promise<MentorProfile> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/mentor_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create mentor profile: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      throw error;
    }
  },

  // Get sales agents by mentor ID
  getSalesAgentsByMentor: async (mentorId: number): Promise<User[]> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/mentor/${mentorId}/sales-agents`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get sales agents for mentor: ${error.message || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting sales agents for mentor ${mentorId}:`, error);
      throw error;
    }
  },

  // Assign a sales agent to a mentor
  assignSalesAgentToMentor: async (mentorId: number, salesAgentId: number): Promise<void> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/mentor/${mentorId}/assign-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ sales_agent_id: salesAgentId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to assign sales agent to mentor: ${error.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error assigning sales agent ${salesAgentId} to mentor ${mentorId}:`, error);
      throw error;
    }
  },

  // Remove a sales agent from a mentor
  removeSalesAgentFromMentor: async (mentorId: number, salesAgentId: number): Promise<void> => {
    try {
      const response = await fetch(`${XANO_BASE_URL}/mentor/${mentorId}/remove-agent/${salesAgentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to remove sales agent from mentor: ${error.message || response.statusText}`);
      }
    } catch (error) {
      console.error(`Error removing sales agent ${salesAgentId} from mentor ${mentorId}:`, error);
      throw error;
    }
  }
};

// Check if auth token is valid
export const checkAuthToken = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return false;
    }
    
    // Try to get current user data to validate token
    const response = await fetch(`${XANO_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('Auth token validation failed:', response.statusText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking auth token:', error);
    return false;
  }
};