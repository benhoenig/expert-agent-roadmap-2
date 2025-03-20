import { tryCatchWrapper, makeApiRequest, getAuthToken } from './xanoClient';
import { salesService } from './salesService';

/**
 * User Types
 */
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
  password: string;
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

/**
 * Utility function to format user-friendly error messages
 * @param error - The error to format
 * @param context - Context of the operation
 * @returns Formatted error message
 */
export const formatUserServiceError = (error: unknown, context: string): string => {
  let errorMessage = `An error occurred during ${context}`;
  
  if (error instanceof Error) {
    // Extract the specific error message
    if (error.message.includes('Missing param:')) {
      // Handle missing parameter errors
      const missingParam = error.message.split('Missing param:')[1]?.trim() || 'unknown field';
      errorMessage = `Missing required field: ${missingParam}. Please provide this information and try again.`;
    } else if (error.message.includes('Failed to update user')) {
      // Handle update-specific errors
      errorMessage = `Failed to update user: ${error.message.split('Failed to update user:')[1]?.trim() || 'Unknown error'}`;
    } else if (error.message.includes('Failed to create user')) {
      // Handle creation-specific errors
      errorMessage = `Failed to create user: ${error.message.split('Failed to create user:')[1]?.trim() || 'Unknown error'}`;
    } else {
      // Use the original error message if it exists
      errorMessage = error.message;
    }
  }
  
  return errorMessage;
};

/**
 * Service for user management operations
 */
export const userService = {
  /**
   * Get all users
   * @returns Array of users
   */
  getUsers: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/user', null, { forceRefresh: true });
      return data;
    }, "Error fetching users");
  },
  
  /**
   * Get a user by ID
   * @param id - User ID
   * @returns User data
   */
  getUserById: async (id: number) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', `/user/${id}`, null, { forceRefresh: true });
      return data;
    }, `Error fetching user with ID ${id}`);
  },
  
  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Created user
   */
  createUser: async (userData: Partial<User>) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('post', '/user', userData, { useCache: false });
      return data;
    }, 'Error creating user');
  },
  
  /**
   * Update a user
   * @param id - User ID
   * @param userData - User data to update
   * @returns Updated user data
   */
  updateUser: async (id: number, userData: Partial<User>) => {
    return tryCatchWrapper(async () => {
      console.log(`[userService] Updating user ${id} with data:`, userData);
      
      // Check if password is included in the update
      const hasPassword = Object.prototype.hasOwnProperty.call(userData, 'password');
      console.log(`[userService] Update includes password: ${hasPassword}`);
      
      // If no password is provided, fetch the current user to get the password
      if (!hasPassword) {
        console.log(`[userService] No password provided, fetching current user data`);
        try {
          const currentUser = await userService.getUserById(id);
          if (currentUser && currentUser.password) {
            console.log(`[userService] Retrieved current password for user ${id}`);
            // Add the current password to the update data
            userData.password = currentUser.password;
          } else {
            console.warn(`[userService] Could not retrieve current password for user ${id}`);
          }
        } catch (error) {
          console.error(`[userService] Error fetching current user data:`, error);
          // Continue with the update even if we couldn't get the current password
        }
      }
      
      // Revert back to using PUT instead of PATCH
      const data = await makeApiRequest('put', `/user/${id}`, userData, { useCache: false });
      return data;
    }, `Error updating user with ID ${id}`);
  },
  
  /**
   * Delete a user
   * @param id - User ID
   */
  deleteUser: async (id: number) => {
    return tryCatchWrapper(async () => {
      await makeApiRequest('delete', `/user/${id}`, null, { useCache: false });
    }, `Error deleting user ${id}`);
  },
  
  /**
   * Check if a username is available
   * @param username - Username to check
   * @returns Whether the username is available
   */
  checkUsernameAvailability: async (username: string) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', `/user/check-username?username=${username}`, null, { useCache: false });
      return { available: data.available };
    }, `Error checking username availability`);
  },
  
  /**
   * Check if a user exists in the database
   * @param id - User ID to check
   * @returns True if the user exists, false otherwise
   */
  checkUserExists: async (id: number) => {
    try {
      // Try to fetch the user - if it succeeds, the user exists
      const user = await userService.getUserById(id);
      return Boolean(user && user.id);
    } catch (error) {
      // If there's an error fetching the user, assume it doesn't exist
      console.warn(`User with ID ${id} does not exist or cannot be accessed`, error);
      return false;
    }
  },
  
  /**
   * Create a sales profile for a user
   * @param userId - User ID to create the profile for
   * @param data - Sales profile data
   * @returns Created sales profile
   */
  createSalesProfile: async (
    profileData: { user_id: number } & Partial<{
      starting_date: string;
      generation: number;
      property_type: string;
      probation_status: string;
      probation_extended: boolean;
      probation_remark: string;
      current_rank: number;
      mentor_id: number;
    }>
  ) => {
    return tryCatchWrapper(async () => {
      const userId = profileData.user_id;
      console.log(`[UserService] Creating sales profile for user ${userId}`);
      
      // Ensure starting_date is provided with a default if missing
      if (!profileData.starting_date) {
        // Default to today's date if not provided
        const today = new Date();
        profileData.starting_date = today.toISOString().split('T')[0];
        console.log(`[UserService] No starting date provided, using today: ${profileData.starting_date}`);
      }
      
      // Set defaults for required fields if not provided
      const salesData = {
        ...profileData,
        generation: profileData.generation || 1,
        property_type: profileData.property_type || 'Condo',
        probation_status: profileData.probation_status || 'Ongoing',
        probation_extended: profileData.probation_extended === undefined ? false : profileData.probation_extended,
        current_rank: profileData.current_rank || 1
      };
      
      // Use the newer function that also generates weeks
      const salesProfile = await salesService.createSalesWithWeeks(salesData);
      
      return salesProfile;
    }, `Error creating sales profile for user ${profileData.user_id}`);
  },
  
  /**
   * Update a sales profile
   * @param profileId - Sales profile ID
   * @param profileData - Sales profile data to update
   * @returns Updated sales profile
   */
  updateSalesProfile: async (profileId: number, profileData: UpdateSalesProfileRequest) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('patch', `/sales/${profileId}`, profileData, { useCache: false });
      return data;
    }, `Error updating sales profile ${profileId}`);
  },
  
  /**
   * Create a mentor profile for a user
   * @param profileData - Mentor profile data
   * @returns Created mentor profile
   */
  createMentorProfile: async (profileData: CreateMentorProfileRequest) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('post', '/mentor_profile', profileData, { useCache: false });
      return data;
    }, 'Error creating mentor profile');
  },
  
  /**
   * Get all sales profiles
   * @returns Array of sales profiles
   */
  getAllSalesProfiles: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/sales', { with: 'user' }, { forceRefresh: true });
      return data;
    }, 'Error fetching sales profiles');
  },
  
  /**
   * Get sales profile by ID
   * @param profileId - Sales profile ID
   * @returns Sales profile data
   */
  getSalesProfileById: async (profileId: number) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', `/sales/${profileId}`, { with: 'user' }, { forceRefresh: true });
      return data;
    }, `Error fetching sales profile ${profileId}`);
  },
  
  /**
   * Get all mentor profiles
   * @returns Array of mentor profiles
   */
  getAllMentorProfiles: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/mentor_profile', null, { forceRefresh: true });
      return data;
    }, 'Error fetching mentor profiles');
  },
  
  /**
   * Get all sales agents for a mentor
   * @param mentorId - Mentor ID
   * @returns Array of sales users
   */
  getSalesAgentsByMentor: async (mentorId: number) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', `/mentor/${mentorId}/sales-agents`, null, { forceRefresh: true });
      return data;
    }, `Error fetching sales agents for mentor ${mentorId}`);
  },
  
  /**
   * Assign a sales agent to a mentor
   * @param mentorId - Mentor ID
   * @param salesAgentId - Sales agent ID
   * @returns Assignment result
   */
  assignSalesAgentToMentor: async (mentorId: number, salesAgentId: number) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('post', `/mentor/${mentorId}/assign-agent`, { sales_id: salesAgentId }, { useCache: false });
      return data;
    }, `Error assigning sales agent ${salesAgentId} to mentor ${mentorId}`);
  },
  
  /**
   * Remove a sales agent from a mentor
   * @param mentorId - Mentor ID
   * @param salesAgentId - Sales agent ID
   * @returns Removal result
   */
  removeSalesAgentFromMentor: async (mentorId: number, salesAgentId: number) => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('delete', `/mentor/${mentorId}/remove-agent/${salesAgentId}`, null, { useCache: false });
      return data;
    }, `Error removing sales agent ${salesAgentId} from mentor ${mentorId}`);
  },
  
  /**
   * Get current user data
   * @returns Current user data
   */
  getCurrentUser: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/auth/me', null, { forceRefresh: true });
      return data;
    }, 'Error fetching current user data');
  },
  
  /**
   * Test API connection
   * @returns Connection test result
   */
  testConnection: async () => {
    return tryCatchWrapper(async () => {
      const data = await makeApiRequest('get', '/user', null, { useCache: false });
      return {
        success: true,
        message: "Connection successful",
        data: data
      };
    }, "API connection test failed");
  },
  
  // Alias for getUsers for backward compatibility
  getAllUsers: async () => userService.getUsers()
};

/**
 * Check if auth token is valid
 * @returns Whether the auth token is valid
 */
export const checkAuthToken = async (): Promise<boolean> => {
  return tryCatchWrapper(async () => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found');
      return false;
    }
    
    try {
      // Try to get current user data to validate token
      await makeApiRequest('get', '/auth/me', null, { 
        forceRefresh: true,
        useCache: false
      });
      return true;
    } catch (error) {
      console.error('Auth token validation failed:', error);
      return false;
    }
  }, 'Error validating auth token');
}; 