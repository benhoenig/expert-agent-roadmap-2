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
  checkAuthToken
} from '../../services/userService';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithProfiles[]>([]);
  console.log('Initial users state:', users);
  
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
      console.log('Users fetched successfully:', fetchedUsers);
      
      setUsers(fetchedUsers);
      console.log('Users state after update:', fetchedUsers);
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
        description: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        description: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        // Update existing user
        user = await userService.updateUser(selectedUser.id, userData);
        
        // Handle role-specific profile updates
        try {
          if (userData.role === 'Sales' && salesData) {
            if (selectedUser.sales_profile?.id) {
              await userService.updateSalesProfile(selectedUser.sales_profile.id, salesData);
            } else {
              await userService.createSalesProfile({
                ...salesData,
                user_id: selectedUser.id,
              } as any);
            }
          } else if (userData.role === 'Mentor' && mentorData && !selectedUser.mentor_profile?.id) {
            await userService.createMentorProfile({
              user_id: selectedUser.id,
            });
          }
        } catch (profileError: any) {
          // Show error but don't fail the whole operation since the user was updated
          toast({
            title: 'Warning',
            description: `User was updated but profile data failed: ${profileError.message}`,
            variant: 'destructive',
          });
        }
        
        toast({
          title: 'Success',
          description: `${userData.full_name} has been updated.`,
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
            } as any);
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
      toast({
        title: 'API Connection Error',
        description: error.message || 'Failed to save user. Please check your connection to the API server.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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