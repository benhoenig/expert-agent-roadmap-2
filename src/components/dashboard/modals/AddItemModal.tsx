import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

// Define the table types
export type TableType = 'kpi' | 'requirement' | 'code-of-honor' | 'rank' | 'rank-promotion';

// Define the props for the modal
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableType: TableType;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

// KPI form schema
const kpiSchema = z.object({
  kpi_name: z.string().min(1, "KPI name is required"),
  kpi_type: z.enum(["Action", "Skillset"], {
    required_error: "KPI type is required",
  }),
});

// Requirement form schema
const requirementSchema = z.object({
  requirement_name: z.string().min(1, "Requirement name is required"),
});

// Code of Honor form schema
const codeOfHonorSchema = z.object({
  code_of_honor_name: z.string().min(1, "Code of Honor name is required"),
  explanation: z.string().min(1, "Explanation is required"),
});

// Rank form schema
const rankSchema = z.object({
  rank_name: z.string().min(1, "Rank name is required"),
  rank_level: z.coerce.number().min(1, "Rank level must be at least 1"),
  manual_promotion: z.boolean().default(false),
  time_requirement_months: z.coerce.number().min(0, "Time requirement must be at least 0"),
});

// Rank Promotion Condition form schema
const rankPromotionSchema = z.object({
  rank_id: z.coerce.number().min(1, "Rank is required"),
  kpi_id: z.coerce.number().min(1, "KPI is required"),
  requirement_id: z.coerce.number().min(1, "Requirement is required"),
  target_count_house: z.coerce.number().min(0, "Target count for houses must be at least 0"),
  target_count_condo: z.coerce.number().min(0, "Target count for condos must be at least 0"),
  minimum_skillset_score: z.coerce.number().min(0, "Minimum skillset score must be at least 0"),
  timeframe_days: z.coerce.number().min(1, "Timeframe must be at least 1 day"),
});

export function AddItemModal({ isOpen, onClose, tableType, onSubmit, isLoading }: AddItemModalProps) {
  // Get the appropriate schema based on the table type
  const getSchema = () => {
    switch (tableType) {
      case 'kpi':
        return kpiSchema;
      case 'requirement':
        return requirementSchema;
      case 'code-of-honor':
        return codeOfHonorSchema;
      case 'rank':
        return rankSchema;
      case 'rank-promotion':
        return rankPromotionSchema;
      default:
        return z.object({});
    }
  };

  // Create the form
  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {},
  });

  // Reset the form when the table type changes
  useEffect(() => {
    form.reset();
  }, [tableType, form]);

  // Handle form submission
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  // Get the title based on the table type
  const getTitle = () => {
    switch (tableType) {
      case 'kpi':
        return "Add New KPI";
      case 'requirement':
        return "Add New Requirement";
      case 'code-of-honor':
        return "Add New Code of Honor";
      case 'rank':
        return "Add New Rank";
      case 'rank-promotion':
        return "Add New Rank Promotion Condition";
      default:
        return "Add New Item";
    }
  };

  // Render the form fields based on the table type
  const renderFormFields = () => {
    switch (tableType) {
      case 'kpi':
        return (
          <>
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter KPI name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kpi_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select KPI type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Skillset">Skillset</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'requirement':
        return (
          <FormField
            control={form.control}
            name="requirement_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirement Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter requirement name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'code-of-honor':
        return (
          <>
            <FormField
              control={form.control}
              name="code_of_honor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code of Honor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code of honor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter explanation" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 'rank':
        return (
          <>
            <FormField
              control={form.control}
              name="rank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter rank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rank_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter rank level" 
                      {...field} 
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time_requirement_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Requirement (Months)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter time requirement in months" 
                      {...field} 
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manual_promotion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Manual Promotion</FormLabel>
                    <FormDescription>
                      Check if this rank requires manual promotion
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </>
        );
      case 'rank-promotion':
        return (
          <>
            <FormField
              control={form.control}
              name="rank_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Rookie</SelectItem>
                      <SelectItem value="2">Junior Agent</SelectItem>
                      <SelectItem value="3">Senior Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kpi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select KPI" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Sales Calls</SelectItem>
                      <SelectItem value="2">Property Viewings</SelectItem>
                      <SelectItem value="3">Contracts Signed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requirement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirement</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select requirement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Monthly Target</SelectItem>
                      <SelectItem value="2">Quarterly Target</SelectItem>
                      <SelectItem value="3">Annual Target</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_count_house"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Count (House)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter target count" 
                        {...field} 
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_count_condo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Count (Condo)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter target count" 
                        {...field} 
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="minimum_skillset_score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Skillset Score</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter minimum score" 
                      {...field} 
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeframe_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeframe (Days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter timeframe in days" 
                      {...field} 
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {renderFormFields()}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 