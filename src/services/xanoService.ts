import axios from "axios";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Helper function to get the token from storage
const getAuthToken = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem("xano_token") || sessionStorage.getItem("xano_token") || null;
};

// Create an axios instance with the base URL
const xanoApi = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
xanoApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service functions
export const xanoService = {
  // Authentication
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    nickname?: string;
    full_name?: string;
    role: string;
  }) => {
    try {
      console.log("Signup request payload:", userData);
      const response = await xanoApi.post("/auth/signup", userData);
      
      // Validate the response contains the expected data
      if (!response.data || !response.data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      // Store the auth token in localStorage by default for signup
      localStorage.setItem("xano_token", response.data.authToken);
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },
  
  login: async (credentials: { username: string; password: string }) => {
    try {
      // Use the credentials directly as they are
      console.log("Login request payload:", { username: credentials.username, password: "********" });
      
      const response = await xanoApi.post("/auth/login", credentials);
      console.log("Login response:", response.data);
      
      if (!response.data || !response.data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      // Token storage is handled in the component based on "Remember Me" checkbox
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      // If it's an Axios error, log more details
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },
  
  // Logout function
  logout: () => {
    // Clear token from both storage locations
    localStorage.removeItem("xano_token");
    sessionStorage.removeItem("xano_token");
  },
  
  // Get current user data
  getUserData: async () => {
    try {
      // This endpoint should return the current user's data based on the auth token
      const response = await xanoApi.get("/auth/me");
      
      // DEBUG: Log the complete response
      console.log("DEBUG: getUserData complete response:", response);
      
      // DEBUG: Log the user data structure
      console.log("DEBUG: getUserData data structure:", JSON.stringify(response.data));
      
      // DEBUG: Check if the response contains an id field
      if (response.data) {
        console.log("DEBUG: getUserData response keys:", Object.keys(response.data));
        
        if (response.data.id) {
          console.log("DEBUG: getUserData id value:", response.data.id, "Type:", typeof response.data.id);
        } else {
          console.warn("DEBUG: getUserData response does not contain an id field");
          
          // Check for any potential ID fields
          Object.entries(response.data).forEach(([key, value]) => {
            if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseInt(value as string)))) {
              console.log(`DEBUG: getUserData potential ID field - ${key}:`, value);
            }
          });
        }
      } else {
        console.warn("DEBUG: getUserData response.data is null or undefined");
      }
      
      return response.data;
    } catch (error) {
      console.error("Get user data error:", error);
      throw error;
    }
  },
  
  // User operations
  getUsers: async () => {
    try {
      const response = await xanoApi.get("/user");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  },
  
  getUserById: async (id: number) => {
    try {
      const response = await xanoApi.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  
  // Test function to check if the API is working
  testConnection: async () => {
    try {
      const response = await xanoApi.get("/user");
      return {
        success: true,
        message: "Connection successful",
        data: response.data
      };
    } catch (error) {
      console.error("API connection test failed:", error);
      return {
        success: false,
        message: "Connection failed",
        error
      };
    }
  },
  
  // KPI operations
  getAllKPIs: async () => {
    try {
      const response = await xanoApi.get("/kpi");
      return response.data;
    } catch (error) {
      console.error("Get all KPIs error:", error);
      throw error;
    }
  },
  
  getKPIById: async (id: number) => {
    try {
      const response = await xanoApi.get(`/kpi/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get KPI error:", error);
      throw error;
    }
  },
  
  // Get current week
  getCurrentWeek: async () => {
    try {
      const response = await xanoApi.get("/week/current");
      return response.data;
    } catch (error) {
      console.error("Get current week error:", error);
      throw error;
    }
  },
  
  // KPI Progress operations
  getAllKPIProgress: async () => {
    try {
      const response = await xanoApi.get("/kpi_skillset_progress");
      return response.data;
    } catch (error) {
      console.error("Get all KPI progress error:", error);
      throw error;
    }
  },
  
  getKPIProgressById: async (id: number) => {
    try {
      const response = await xanoApi.get(`/kpi_skillset_progress/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get KPI progress error:", error);
      throw error;
    }
  },
  
  addKPIProgress: async (progressData: {
    date: Date;
    kpi_type: string;
    kpi_name: string;
    kpi_id?: number;
    action_count?: number;
    wording_score?: number;
    tonality_score?: number;
    rapport_score?: number;
    average_score?: number;
    remark?: string;
    user_id?: number;
    week_id?: number;
    attachment?: File;
  }) => {
    try {
      // DEBUG: Log the incoming user_id
      console.log("DEBUG: Incoming user_id:", progressData.user_id, "Type:", typeof progressData.user_id);
      
      // Get the sales record for this user_id for both Action and Skillset KPIs
      let salesId = null;
      if (progressData.user_id) {
        try {
          const salesRecord = await xanoService.getSalesByUserId(progressData.user_id);
          if (salesRecord && salesRecord.id) {
            salesId = salesRecord.id;
            console.log(`Found sales_id: ${salesId} for user_id: ${progressData.user_id}`);
          } else {
            console.warn(`No sales record found for user_id: ${progressData.user_id}, will use user_id as fallback`);
            salesId = progressData.user_id;
          }
        } catch (error) {
          console.error("Error fetching sales record:", error);
          console.warn("Using user_id as fallback for sales_id");
          salesId = progressData.user_id;
        }
      }
      
      // Format the date as YYYY-MM-DD
      const formattedDate = progressData.date instanceof Date 
        ? progressData.date.toISOString().split('T')[0] 
        : progressData.date;

      // Determine the correct endpoint based on KPI type
      const endpoint = progressData.kpi_type === "Action" || progressData.kpi_type === "action"
        ? "/kpi_action_progress" 
        : "/kpi_skillset_progress";
      
      console.log(`Using endpoint: ${endpoint} for KPI type: ${progressData.kpi_type}`);

      // Create a payload with the correct field names based on KPI type
      let payload: Record<string, any> = { 
        remark: progressData.remark || "" 
      };
      
      // Map fields correctly based on KPI type
      if (progressData.kpi_type === "Action" || progressData.kpi_type === "action") {
        // For Action KPIs, use the expected field names for the action progress endpoint
        // Use the salesId we fetched, or fall back to user_id if needed
        const finalSalesId = salesId || (typeof progressData.user_id === 'number' ? progressData.user_id : parseInt(String(progressData.user_id), 10));
        
        // DEBUG: Log the sales_id we're using
        console.log("DEBUG: Using sales_id:", finalSalesId, "Type:", typeof finalSalesId);
        console.log("DEBUG: Is sales_id NaN?", isNaN(finalSalesId));
        
        payload = {
          ...payload,
          date_added: formattedDate,  // Match the field name in the database
          count: progressData.action_count,
          // Use the correct sales_id
          sales_id: finalSalesId,
          // Add updated_at field with current timestamp
          updated_at: new Date().toISOString(),
          // Set mentor_edited to 0 by default
          mentor_edited: 0
        };
        
        // DEBUG: Log the payload sales_id
        console.log("DEBUG: Payload sales_id:", payload.sales_id, "Type:", typeof payload.sales_id);
        
        // Add week_id if provided, otherwise try to get the current week
        if (progressData.week_id) {
          payload.week_id = progressData.week_id;
        } else {
          try {
            // Try to get the current week
            const currentWeek = await xanoService.getCurrentWeek();
            if (currentWeek && currentWeek.id) {
              payload.week_id = currentWeek.id;
              console.log(`Using current week ID: ${currentWeek.id}`);
            } else {
              // If no current week is found, use a default value of 1
              payload.week_id = 1;
              console.warn("No current week found, using default week_id: 1");
            }
          } catch (error) {
            console.error("Error getting current week:", error);
            // Use a default value of 1 if there's an error
            payload.week_id = 1;
            console.warn("Error getting current week, using default week_id: 1");
          }
        }
        
        // Use the provided kpi_id directly
        if (progressData.kpi_id) {
          payload.kpi_id = progressData.kpi_id;
          console.log(`Using provided KPI ID: ${progressData.kpi_id} (${typeof progressData.kpi_id}) for ${progressData.kpi_name}`);
        } else {
          console.warn(`No KPI ID provided for KPI name: ${progressData.kpi_name}`);
          throw new Error("KPI ID is required for Action KPI progress");
        }
        
        console.log("Mapped Action KPI payload:", payload);
        // DEBUG: Log the final payload structure
        console.log("DEBUG: Final payload structure:", JSON.stringify(payload));
      } else {
        // For Skillset KPIs, use the expected field names for the skillset progress endpoint
        // Use the salesId we fetched, or fall back to user_id if needed
        const finalSalesId = salesId || (typeof progressData.user_id === 'number' ? progressData.user_id : parseInt(String(progressData.user_id), 10));
        
        // DEBUG: Log the sales_id we're using for skillset KPI
        console.log("DEBUG: Using sales_id for skillset KPI:", finalSalesId, "Type:", typeof finalSalesId);
        
        payload = {
          ...payload,
          date_added: formattedDate,  // Match the field name in the database
          wording_score: progressData.wording_score,
          tonality_score: progressData.tonality_score,
          rapport_score: progressData.rapport_score,
          // Calculate total_score as the average of the three scores
          total_score: progressData.average_score || Math.round((
            (progressData.wording_score || 0) + 
            (progressData.tonality_score || 0) + 
            (progressData.rapport_score || 0)
          ) / 3),
          // Use the correct sales_id
          sales_id: finalSalesId,
          // Add updated_at field with current timestamp
          updated_at: new Date().toISOString(),
          // Set mentor_edited to 0 by default
          mentor_edited: 0
        };
        
        // DEBUG: Log the payload sales_id for skillset KPI
        console.log("DEBUG: Payload sales_id for skillset KPI:", payload.sales_id, "Type:", typeof payload.sales_id);
        
        // Add week_id if provided, otherwise try to get the current week
        if (progressData.week_id) {
          payload.week_id = progressData.week_id;
        } else {
          try {
            // Try to get the current week
            const currentWeek = await xanoService.getCurrentWeek();
            if (currentWeek && currentWeek.id) {
              payload.week_id = currentWeek.id;
              console.log(`Using current week ID: ${currentWeek.id}`);
            } else {
              // If no current week is found, use a default value of 1
              payload.week_id = 1;
              console.warn("No current week found, using default week_id: 1");
            }
          } catch (error) {
            console.error("Error getting current week:", error);
            // Use a default value of 1 if there's an error
            payload.week_id = 1;
            console.warn("Error getting current week, using default week_id: 1");
          }
        }
        
        // Use the provided kpi_id directly
        if (progressData.kpi_id) {
          payload.kpi_id = progressData.kpi_id;
          console.log(`Using provided KPI ID: ${progressData.kpi_id} (${typeof progressData.kpi_id}) for ${progressData.kpi_name}`);
        } else {
          console.warn(`No KPI ID provided for KPI name: ${progressData.kpi_name}`);
          throw new Error("KPI ID is required for Skillset KPI progress");
        }
        
        console.log("Mapped Skillset KPI payload:", payload);
        // DEBUG: Log the final payload structure
        console.log("DEBUG: Final skillset payload structure:", JSON.stringify(payload));
      }

      // If there's an attachment, use FormData
      if (progressData.attachment) {
        const formData = new FormData();
        
        // Add the attachment first
        if (progressData.attachment) {
          console.log("Adding attachment to FormData");
          formData.append('attachment', progressData.attachment);
          
          // Add path parameter for file upload - this is required by the Xano API
          // Use a fixed path format that matches exactly what the API expects
          const uploadPath = 'kpi_attachments/' + progressData.attachment.name;
          formData.append('path', uploadPath);
          console.log(`Adding path parameter for file upload: ${uploadPath}`);
        }
        
        // Add all other fields to FormData after the attachment and path
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            console.log(`Adding to FormData: ${key} = ${value} (${typeof value})`);
            formData.append(key, String(value));
          }
        });
        
        // Log FormData entries for debugging
        console.log("FormData entries:");
        for (const pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        
        // Use the original endpoint without query parameters
        console.log(`Using endpoint for file upload: ${endpoint}`);
        
        try {
          const response = await xanoApi.post(endpoint, formData, {
            headers: {
              // Remove Content-Type header to let the browser set it with the boundary
              // 'Content-Type': 'multipart/form-data',
            },
          });
          
          // Log the response data
          console.log(`Response from ${endpoint}:`, response.data);
          
          // DEBUG: Check if sales_id is in the response
          if (response.data) {
            console.log("DEBUG: Response contains sales_id?", response.data.hasOwnProperty('sales_id'));
            if (response.data.hasOwnProperty('sales_id')) {
              console.log("DEBUG: Response sales_id value:", response.data.sales_id);
            }
          }
          
          return response.data;
        } catch (error) {
          console.error("File upload error:", error);
          
          // If the first attempt fails, try with a different approach
          console.log("First upload attempt failed, trying alternative approach...");
          
          // Create a new FormData object
          const altFormData = new FormData();
          
          // Add the path first, then the attachment
          const uploadPath = 'kpi_attachments/' + progressData.attachment.name;
          altFormData.append('path', uploadPath);
          altFormData.append('attachment', progressData.attachment);
          
          // Add all other fields
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              altFormData.append(key, String(value));
            }
          });
          
          console.log("Alternative approach - FormData entries:");
          for (const pair of altFormData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
          
          // Try the request again
          const altResponse = await xanoApi.post(endpoint, altFormData);
          console.log(`Alternative approach - Response:`, altResponse.data);
          return altResponse.data;
        }
      } else {
        // If no attachment, we can send JSON directly
        console.log(`Sending KPI progress to ${endpoint}:`, payload);
        
        // Log the payload types for debugging
        console.log("Payload field types:");
        let hasSalesId = false;
        Object.entries(payload).forEach(([key, value]) => {
          console.log(`${key}: ${typeof value} = ${value}`);
          if (key === 'sales_id' || key === 'user_id') {
            hasSalesId = true;
            console.log(`DEBUG: ${key} found in payload:`, value);
          }
        });
        
        // DEBUG: Check if sales_id is in payload
        if (!hasSalesId) {
          console.warn("DEBUG: sales_id is missing from payload!");
        }
        
        // Try different formats for the sales_id field
        if (progressData.kpi_type === "Action" || progressData.kpi_type === "action" || 
            progressData.kpi_type === "Skillset" || progressData.kpi_type === "skillset") {
          // Try as a string
          payload.sales_id = String(payload.sales_id);
          console.log("DEBUG: Converting sales_id to string:", payload.sales_id);
        }
        
        const response = await xanoApi.post(endpoint, payload);
        
        // Log the response data
        console.log(`Response from ${endpoint}:`, response.data);
        
        // DEBUG: Check if sales_id is in the response
        if (response.data) {
          console.log("DEBUG: Response contains sales_id?", response.data.hasOwnProperty('sales_id'));
          if (response.data.hasOwnProperty('sales_id')) {
            console.log("DEBUG: Response sales_id value:", response.data.sales_id);
          }
        }
        
        return response.data;
      }
    } catch (error: any) {
      console.error("Add KPI progress error:", error);
      
      // Log more detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      
      throw error;
    }
  },
  
  updateKPIProgress: async (id: number, progressData: {
    date?: Date;
    kpi_type?: string;
    kpi_name?: string;
    action_count?: number;
    wording_score?: number;
    tonality_score?: number;
    rapport_score?: number;
    average_score?: number;
    remark?: string;
    attachment?: File;
  }) => {
    try {
      // If there's an attachment, we need to use FormData
      if (progressData.attachment) {
        const formData = new FormData();
        
        // Add all other fields to the form data
        Object.entries(progressData).forEach(([key, value]) => {
          if (key === 'attachment' && value instanceof File) {
            formData.append('attachment', value);
          } else if (key === 'date' && value instanceof Date) {
            formData.append('date', value.toISOString());
          } else if (value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        const response = await xanoApi.patch(`/kpi_skillset_progress/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        // If no attachment, we can send JSON directly
        const payload: Record<string, any> = { ...progressData };
        
        // Convert date to ISO string if it exists
        if (payload.date instanceof Date) {
          payload.date = payload.date.toISOString();
        }
        
        // Remove attachment field if it exists
        delete payload.attachment;
        
        const response = await xanoApi.patch(`/kpi_skillset_progress/${id}`, payload);
        return response.data;
      }
    } catch (error) {
      console.error("Update KPI progress error:", error);
      throw error;
    }
  },
  
  deleteKPIProgress: async (id: number) => {
    try {
      const response = await xanoApi.delete(`/kpi_skillset_progress/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete KPI progress error:", error);
      throw error;
    }
  },
  
  // Get sales record by user_id
  getSalesByUserId: async (userId: number) => {
    try {
      console.log(`Fetching sales record for user_id: ${userId}`);
      
      // Fetch all sales records
      const response = await xanoApi.get(`/sales`);
      
      console.log(`Got ${response.data.length} sales records, searching for user_id: ${userId}`);
      
      // Log all records for debugging
      response.data.forEach((record, index) => {
        console.log(`Sales record ${index}: id=${record.id}, user_id=${record.user_id}`);
      });
      
      // Find the record where user_id matches our userId
      const matchingRecord = response.data.find(record => record.user_id === userId);
      
      if (matchingRecord) {
        console.log(`Found matching sales record with id: ${matchingRecord.id} for user_id: ${userId}`);
        return matchingRecord;
      }
      
      console.warn(`No sales record found with exact user_id: ${userId}`);
      
      // As a fallback, try to find a record where the user_id field contains our userId as a string
      const fallbackRecord = response.data.find(record => 
        record.user_id && String(record.user_id).includes(String(userId))
      );
      
      if (fallbackRecord) {
        console.log(`Found fallback sales record with id: ${fallbackRecord.id} containing user_id: ${userId}`);
        return fallbackRecord;
      }
      
      console.warn(`No sales record found for user_id: ${userId}, even with fallback search`);
      return null;
    } catch (error) {
      console.error(`Error fetching sales record for user_id ${userId}:`, error);
      throw error;
    }
  },
}; 