import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../../ui/dialog";
import { Form } from "../../ui/form";
import { Button } from "../../ui/button";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "../../ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from '../../../components/ui/use-toast';
import { userFormSchema, UserFormValues, UserFormProps } from './types';
import { BasicInformationTab } from './BasicInformationTab';
import { SalesDetailsTab } from './SalesDetailsTab';

export function UserForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user, 
  salesProfile, 
  mentorProfile, 
  isLoading: isSubmitting
}: UserFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Initialize the form with default values or existing user data
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      password: user ? undefined : '', // Only require password for new users
      full_name: user?.full_name || '',
      nickname: user?.nickname || '',
      role: user?.role || 'Admin',
      user_status: user?.user_status || 'Active',
      id: user?.id,
      
      // Sales-specific fields
      starting_date: salesProfile?.starting_date ? new Date(salesProfile.starting_date) : undefined,
      generation: salesProfile?.generation,
      property_type: salesProfile?.property_type,
      probation_status: salesProfile?.probation_status || 'Ongoing',
      probation_extended: salesProfile?.probation_extended || false,
      probation_remark: salesProfile?.probation_remark || '',
    }
  });
  
  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      console.log('Resetting form with user data:', user);
      // Make sure we're setting ALL fields from the user object
      form.reset({
        username: user.username || '',
        email: user.email || '',
        password: undefined, // Don't set password for existing users
        full_name: user.full_name || '',
        nickname: user.nickname || '',
        role: user.role || 'Admin',
        user_status: user.user_status || 'Active',
        id: user.id,
        
        // Sales-specific fields
        starting_date: salesProfile?.starting_date ? new Date(salesProfile.starting_date) : undefined,
        generation: salesProfile?.generation,
        property_type: salesProfile?.property_type,
        probation_status: salesProfile?.probation_status || 'Ongoing',
        probation_extended: salesProfile?.probation_extended || false,
        probation_remark: salesProfile?.probation_remark || '',
      });
    }
  }, [user, salesProfile, form]);
  
  // Get the current role value from the form
  const currentRole = form.watch('role');
  
  // Update active tab when role changes
  useEffect(() => {
    setActiveTab('basic');
  }, [currentRole]);
  
  // Handle form submission
  const handleSubmit = async (values: UserFormValues) => {
    console.log('Form submitted with values:', values);
    console.log('Original user data:', user);
    
    try {
      let userData: Record<string, any> = {};
      
      if (user?.id) {
        // For updates, always send the complete user object with all fields
        // This prevents data loss if the API replaces rather than updates
        
        // Start with all the original user data
        userData = {
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          full_name: user.full_name || '',
          nickname: user.nickname || '',
          role: user.role || 'Admin',
          user_status: user.user_status || 'Active',
        };
        
        // Override with any changed values from the form
        if (values.username) userData.username = values.username;
        if (values.email) userData.email = values.email;
        if (values.full_name) userData.full_name = values.full_name;
        if (values.nickname) userData.nickname = values.nickname;
        if (values.role) userData.role = values.role;
        if (values.user_status) userData.user_status = values.user_status;
        
        // Special handling for password:
        // Only include password if it was provided and not empty
        // Otherwise, the service will fetch the current password
        if (values.password && values.password.trim() !== '') {
          userData.password = values.password;
          console.log('New password provided, will be updated');
        } else {
          console.log('No new password provided, service will use current password');
          // We don't include password here - the service will fetch it
        }
        
        console.log('Sending complete user data with changes:', userData);
      } else {
        // For new users, include all fields including password
        userData = { ...values };
      }
      
      // Prepare sales profile data if role is Sales
      let salesData: Partial<any> | undefined;
      if (values.role === 'Sales') {
        // For existing sales profiles, only include changed fields
        if (user?.id && salesProfile?.id) {
          const originalSalesData = {
            starting_date: salesProfile.starting_date,
            generation: salesProfile.generation,
            property_type: salesProfile.property_type,
            probation_status: salesProfile.probation_status,
            probation_extended: salesProfile.probation_extended,
            probation_remark: salesProfile.probation_remark,
          };
          
          console.log('Original sales data for comparison:', originalSalesData);
          
          // Add one day to compensate for timezone shift
          const formattedStartingDate = values.starting_date ? 
            new Date(values.starting_date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
          
          salesData = {
            user_id: user.id,
          };
          
          // Only include fields that changed
          if (formattedStartingDate !== originalSalesData.starting_date) {
            salesData.starting_date = formattedStartingDate;
          }
          
          if (values.generation !== originalSalesData.generation) {
            salesData.generation = values.generation || 1;
          }
          
          if (values.property_type !== originalSalesData.property_type) {
            salesData.property_type = values.property_type || 'House';
          }
          
          if (values.probation_status !== originalSalesData.probation_status) {
            salesData.probation_status = values.probation_status || 'Ongoing';
          }
          
          if (values.probation_extended !== originalSalesData.probation_extended) {
            salesData.probation_extended = values.probation_extended || false;
          }
          
          if (values.probation_remark !== originalSalesData.probation_remark) {
            salesData.probation_remark = values.probation_remark;
          }
          
          console.log('Sending only changed sales fields:', salesData);
          
          // If no fields changed other than user_id, don't send the update
          if (Object.keys(salesData).length <= 1) {
            salesData = undefined;
          }
        } else {
          // For new sales profiles, include all fields
          salesData = {
            user_id: user?.id,
            starting_date: values.starting_date ? 
              new Date(values.starting_date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
            generation: values.generation || 1,
            property_type: values.property_type || 'House',
            probation_status: values.probation_status || 'Ongoing',
            probation_extended: values.probation_extended || false,
            probation_remark: values.probation_remark,
          };
          
          console.log('Creating new sales profile with data:', salesData);
        }
      }
      
      // Prepare mentor profile data if role is Mentor
      let mentorData: Partial<any> | undefined;
      if (values.role === 'Mentor') {
        // Only create a new mentor profile if one doesn't exist
        if (user?.id && !mentorProfile?.id) {
          mentorData = {
            user_id: user.id,
          };
          console.log('Creating new mentor profile with data:', mentorData);
        } else if (!user?.id) {
          // For new users who are mentors
          mentorData = {
            user_id: null, // Will be updated after user creation
          };
          console.log('Preparing mentor profile for new user');
        } else {
          // Existing mentor - no need to update the profile
          console.log('Existing mentor profile - no update needed');
        }
      }
      
      console.log('Final data being sent to API:', {
        userData,
        salesData,
        mentorData
      });
      
      // Call the onSubmit callback with the form values and role-specific data
      await onSubmit(userData, salesData, mentorData);
      
      // Show success message
      toast({
        title: "Success",
        description: user ? "User updated successfully" : "User created successfully",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save user data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full ${currentRole === 'Sales' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                {currentRole === 'Sales' && (
                  <TabsTrigger value="sales">Sales Details</TabsTrigger>
                )}
              </TabsList>
              
              {/* Basic Information Tab */}
              <BasicInformationTab form={form} />
              
              {/* Sales Details Tab */}
              {currentRole === 'Sales' && (
                <SalesDetailsTab 
                  form={form} 
                  calendarOpen={calendarOpen} 
                  setCalendarOpen={setCalendarOpen} 
                />
              )}
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={() => console.log('Submit button clicked', form.formState.errors)}
              >
                {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 