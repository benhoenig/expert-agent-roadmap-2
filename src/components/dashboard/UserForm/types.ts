import * as z from 'zod';
import { User, SalesProfile, MentorProfile } from '../../../services/api/userService';

// Define the form schema with Zod
export const userFormSchema = z.object({
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
  
  // For edit mode, we might have an ID
  id: z.number().optional(),
}).refine((data) => {
  // If this is a new user (no ID), password is required
  // We can't access the user prop directly, so we'll check in the form component
  return true;
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormValues, salesData?: Partial<SalesProfile>, mentorData?: Partial<MentorProfile>) => void;
  user?: User;
  salesProfile?: SalesProfile;
  mentorProfile?: MentorProfile;
  isLoading: boolean;
} 