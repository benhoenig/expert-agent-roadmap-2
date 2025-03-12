import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { User, SalesProfile, MentorProfile } from '../../services/userService';

// Define the form schema with Zod
const userFormSchema = z.object({
  // Common fields for all users
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.union([
    z.string().min(6, 'Password must be at least 6 characters'),
    z.undefined()
  ]).optional(),
  full_name: z.string().min(1, 'Full name is required'),
  nickname: z.string().optional(),
  role: z.enum(['Admin', 'Mentor', 'Sales']),
  user_status: z.enum(['Active', 'Warning', 'Terminate', 'Quit']),
  
  // Sales-specific fields
  starting_date: z.date().optional(),
  generation: z.number().int().positive().optional(),
  property_type: z.enum(['House', 'Condo']).optional(),
  probation_status: z.enum(['Ongoing', 'Passed', 'Failed']).optional(),
  probation_extended: z.boolean().optional(),
  probation_remark: z.string().optional(),
}).refine((data) => {
  // If this is a new user (no ID), password is required
  // We can't access the user prop directly, so we'll check in the form component
  return true;
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormValues, salesData?: Partial<SalesProfile>, mentorData?: Partial<MentorProfile>) => void;
  user?: User;
  salesProfile?: SalesProfile;
  mentorProfile?: MentorProfile;
  isLoading: boolean;
}

export function UserForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user, 
  salesProfile, 
  mentorProfile, 
  isLoading 
}: UserFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  
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
      
      // Sales-specific fields
      starting_date: salesProfile?.starting_date ? new Date(salesProfile.starting_date) : undefined,
      generation: salesProfile?.generation,
      property_type: salesProfile?.property_type,
      probation_status: salesProfile?.probation_status || 'Ongoing',
      probation_extended: salesProfile?.probation_extended || false,
      probation_remark: salesProfile?.probation_remark || '',
    }
  });
  
  // Get the current role value from the form
  const currentRole = form.watch('role');
  
  // Update active tab when role changes
  useEffect(() => {
    setActiveTab('basic');
  }, [currentRole]);
  
  // Handle form submission
  const handleSubmit = (values: UserFormValues) => {
    console.log('Form submitted with values:', values);
    
    // Prepare sales profile data if role is Sales
    let salesData: Partial<SalesProfile> | undefined;
    if (values.role === 'Sales') {
      salesData = {
        user_id: user?.id,
        starting_date: values.starting_date?.toISOString().split('T')[0] || '',
        generation: values.generation || 1,
        property_type: values.property_type || 'House',
        probation_status: values.probation_status || 'Ongoing',
        probation_extended: values.probation_extended || false,
        probation_remark: values.probation_remark,
      };
    }
    
    // Prepare mentor profile data if role is Mentor
    let mentorData: Partial<MentorProfile> | undefined;
    if (values.role === 'Mentor') {
      mentorData = {
        user_id: user?.id,
      };
    }
    
    // Call the onSubmit callback with the form values and role-specific data
    onSubmit(values, salesData, mentorData);
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                {currentRole === 'Sales' && (
                  <TabsTrigger value="sales">Sales Details</TabsTrigger>
                )}
                {currentRole === 'Mentor' && (
                  <TabsTrigger value="mentor">Mentor Details</TabsTrigger>
                )}
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nickname</FormLabel>
                        <FormControl>
                          <Input placeholder="Johnny" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{user ? 'New Password (optional)' : 'Password'}</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder={user ? "Leave blank to keep current" : "Enter password"} 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => {
                              // If the field is empty and this is an edit, set to undefined
                              // Otherwise use the value
                              const value = e.target.value === '' && user ? undefined : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Mentor">Mentor</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="user_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Warning">Warning</SelectItem>
                          <SelectItem value="Terminate">Terminate</SelectItem>
                          <SelectItem value="Quit">Quit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Sales Details Tab */}
              {currentRole === 'Sales' && (
                <TabsContent value="sales" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="starting_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Starting Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="generation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Generation</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="1" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Condo">Condo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="probation_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probation Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select probation status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Passed">Passed</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {(form.watch('probation_status') === 'Ongoing') && (
                    <>
                      <FormField
                        control={form.control}
                        name="probation_extended"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Probation Extended</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Check this if the probation period has been extended.
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="probation_remark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probation Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter any remarks about the probation status"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </TabsContent>
              )}
              
              {/* Mentor Details Tab */}
              {currentRole === 'Mentor' && (
                <TabsContent value="mentor" className="space-y-4 pt-4">
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      No additional information is required for Mentor users. 
                      After creating the user, you can assign sales agents to this mentor.
                    </p>
                  </div>
                </TabsContent>
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 