import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/button';
import { UserPlus, Loader2, RefreshCw } from 'lucide-react';
import { UserTable } from '../../components/dashboard/UserTable';
import { UserForm } from '../../components/dashboard/UserForm';
import { 
  userService, 
  User, 
  SalesProfile, 
  MentorProfile, 
  UserWithProfiles,
  checkAuthToken,
  formatUserServiceError
} from '../../services/api/userService';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithProfiles[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfiles | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  
  // Function to redirect to login page
  const redirectToLogin = () => {
    toast({
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      variant: 'destructive',
    });
    
    // Clear any auth tokens
    localStorage.removeItem('xano_token');
    sessionStorage.removeItem('xano_token');
    
    // Redirect to login page
    navigate('/auth/login');
  };
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Function to fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Check if auth token is valid
      const isTokenValid = await checkAuthToken();
      if (!isTokenValid) {
        redirectToLogin();
        return;
      }
      
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && 
          (error.message.includes('authentication') || 
           error.message.includes('token') || 
           error.message.includes('unauthorized') || 
           error.message.includes('401'))) {
        redirectToLogin();
        return;
      }
      
      toast({
        title: 'API Connection Error',
        description: formatUserServiceError(error, 'user fetching'),
        variant: 'destructive',
      });
      
      // Set empty array to show no users available
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle opening the form for creating a new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  
  // Handle opening the form for editing an existing user
  const handleEditUser = (user: UserWithProfiles) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  
  // Handle viewing a user's details
  const handleViewUser = (user: UserWithProfiles) => {
    // For now, just open the edit form in read-only mode
    // In a real app, you might want to navigate to a user details page
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  
  // Handle deleting a user
  const handleDeleteUser = async (user: UserWithProfiles) => {
    if (!user.id) return;
    
    if (!window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await userService.deleteUser(user.id);
      
      // Update the local state to remove the deleted user
      setUsers(users.filter(u => u.id !== user.id));
      
      toast({
        title: 'Success',
        description: `${user.full_name} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'API Connection Error',
        description: formatUserServiceError(error, 'user deletion'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission (create or update user)
  const handleFormSubmit = async (
    userData: any, 
    salesData?: Partial<SalesProfile>, 
    mentorData?: Partial<MentorProfile>
  ) => {
    setIsSubmitting(true);
    
    try {
      let user: User;
      
      // Check if we're updating an existing user or creating a new one
      if (selectedUser?.id) {
        // STEP 1: Determine what data is changing
        const userDataChanges = {};
        const salesDataChanges = {};
        let hasUserChanges = false;
        let hasSalesChanges = false;
        
        // Check for user data changes
        if (userData) {
          Object.keys(userData).forEach(key => {
            if (key !== 'id' && userData[key] !== selectedUser[key as keyof User]) {
              hasUserChanges = true;
              userDataChanges[key] = userData[key];
            }
          });
        }
        
        // Check for sales data changes
        if (salesData) {
          hasSalesChanges = Object.keys(salesData).length > 0;
        }
        
        console.log('Change detection:', { hasUserChanges, hasSalesChanges });
        
        // STEP 2: Update user data if needed
        if (hasUserChanges) {
          try {
            user = await userService.updateUser(selectedUser.id, userData);
            console.log('User data updated successfully');
          } catch (userError) {
            console.error('Error updating user data:', userError);
            toast({
              title: 'Warning',
              description: 'Could not update user data. Will try to update profile data only.',
              variant: 'destructive',
            });
            user = selectedUser;
          }
        } else {
          console.log('No changes to user data, skipping user update');
          user = selectedUser;
        }
        
        // STEP 3: Handle sales profile updates if needed
        if (hasSalesChanges && (userData.role === 'Sales' || selectedUser.role === 'Sales')) {
          try {
            // First check if the user has a sales profile
            let salesProfileId = selectedUser.sales_profile?.id;
            
            // If sales profile ID is not available in the selected user, try to find it by user_id
            if (!salesProfileId) {
              console.log('Sales profile not found in selected user data, looking up by user_id');
              try {
                // Get all sales profiles and filter by user_id
                const allSalesProfiles = await userService.getAllSalesProfiles();
                const userSalesProfile = allSalesProfiles.find(
                  profile => profile.user_id === selectedUser.id
                );
                
                if (userSalesProfile) {
                  console.log('Found sales profile by user_id:', userSalesProfile.id);
                  salesProfileId = userSalesProfile.id;
                }
              } catch (lookupError) {
                console.error('Error looking up sales profile by user_id:', lookupError);
              }
            }
            
            // Now we either have a sales profile ID or we don't
            if (salesProfileId) {
              // Update existing sales profile
              await userService.updateSalesProfile(salesProfileId, salesData);
              console.log('Sales profile updated successfully');
            } else {
              // Create new sales profile
              console.log('No existing sales profile found, creating new one');
              await userService.createSalesProfile({
                ...salesData,
                user_id: selectedUser.id,
                // Ensure all required fields are present with defaults if needed
                starting_date: salesData.starting_date || new Date().toISOString(),
                generation: salesData.generation || 1,
                property_type: salesData.property_type || 'House',
                probation_status: salesData.probation_status || 'Ongoing',
                probation_extended: salesData.probation_extended || false,
              });
              console.log('New sales profile created successfully');
            }
          } catch (salesError) {
            console.error('Error updating sales profile:', salesError);
            toast({
              title: 'Warning',
              description: `Could not update sales profile: ${salesError.message}`,
              variant: 'destructive',
            });
          }
        }
        
        // Similar handling for mentor profiles...
        if ((userData.role === 'Mentor' || selectedUser.role === 'Mentor') && 
            mentorData && !selectedUser.mentor_profile?.id) {
          // Check if the mentor_profile endpoint exists before trying to create
          try {
            await userService.createMentorProfile({
              user_id: selectedUser.id,
            });
          } catch (mentorError) {
            console.error('Error creating mentor profile:', mentorError);
            // Don't fail the whole operation if mentor profile creation fails
            toast({
              title: 'Warning',
              description: 'User was updated but mentor profile could not be created. This may be a backend configuration issue.',
              variant: 'destructive',
            });
          }
        }
        
        toast({
          title: 'Success',
          description: `${userData.full_name || selectedUser.full_name} has been updated.`,
        });
      } else {
        // Create new user
        user = await userService.createUser(userData);
        
        // Create role-specific profile if needed
        try {
          if (userData.role === 'Sales' && salesData) {
            await userService.createSalesProfile({
              ...salesData,
              user_id: user.id,
              starting_date: salesData.starting_date || new Date().toISOString(),
              generation: salesData.generation || 1,
              property_type: salesData.property_type || 'House',
              probation_status: salesData.probation_status || 'Ongoing',
              probation_extended: salesData.probation_extended || false,
            });
          } else if (userData.role === 'Mentor' && mentorData) {
            await userService.createMentorProfile({
              user_id: user.id,
            });
          }
        } catch (profileError: any) {
          // Show error but don't fail the whole operation since the user was created
          toast({
            title: 'Warning',
            description: `User was created but profile data failed: ${profileError.message}`,
            variant: 'destructive',
          });
        }
        
        toast({
          title: 'Success',
          description: `${userData.full_name} has been created.`,
        });
      }
      
      // Refresh the user list
      fetchUsers();
      
      // Close the form
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Use the centralized error formatting helper
      const errorMessage = formatUserServiceError(error, selectedUser?.id ? 'user update' : 'user creation');
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsFormOpen(false);
    }
  };
  
  // Add useEffect to log users and loading state
  useEffect(() => {
    console.log('Users state updated:', users);
    console.log('Loading state:', isLoading);
  }, [users, isLoading]);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage users, roles, and permissions"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleCreateUser}>
              Add User
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchUsers}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        }
      />
      
      <UserTable 
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onView={handleViewUser}
        onCreateUser={handleCreateUser}
        isLoading={isLoading}
      />
      
      {isFormOpen && (
        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          user={selectedUser || undefined}
          salesProfile={selectedUser?.sales_profile}
          mentorProfile={selectedUser?.mentor_profile}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
} 