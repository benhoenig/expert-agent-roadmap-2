import { useState, useEffect } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';
import { 
  requirementService, 
  Requirement as RequirementType 
} from '../../../services/requirementService';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

interface RequirementTableProps {
  isLoading: boolean;
}

// Requirement form schema
const requirementSchema = z.object({
  requirement_name: z.string().min(1, "Requirement name is required"),
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

export function RequirementTable({ isLoading: externalLoading }: RequirementTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RequirementType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RequirementType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create the form
  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      requirement_name: "",
    },
  });

  // Update form values when selected item changes
  useEffect(() => {
    if (selectedItem) {
      form.setValue("requirement_name", selectedItem.requirement_name);
    }
  }, [selectedItem, form]);

  // Fetch requirements on component mount
  useEffect(() => {
    fetchRequirements();
  }, []);

  // Fetch requirements from the API
  const fetchRequirements = async () => {
    setIsLoading(true);
    try {
      const requirements = await requirementService.getAllRequirements();
      setItems(requirements);
    } catch (error: any) {
      console.error('Error fetching requirements:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch requirements',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Requirement Name', accessor: 'requirement_name' as keyof RequirementType },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof RequirementType,
      cell: (item: RequirementType) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: RequirementType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: RequirementType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (item: RequirementType) => {
    toast({
      title: 'View Requirement',
      description: `Viewing details for ${item.requirement_name}`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await requirementService.deleteRequirement(selectedItem.id);
      toast({
        title: 'Success',
        description: `Requirement "${selectedItem.requirement_name}" has been deleted.`,
      });
      // Refresh the requirements list
      fetchRequirements();
    } catch (error: any) {
      console.error('Error deleting requirement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete requirement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateRequirement = async (data: RequirementFormValues) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await requirementService.updateRequirement(selectedItem.id, data);
      toast({
        title: 'Success',
        description: `Requirement "${selectedItem.requirement_name}" has been updated.`,
      });
      // Refresh the requirements list
      fetchRequirements();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating requirement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update requirement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BaseTable
        items={items}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading || externalLoading}
        searchPlaceholder="Search requirements..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the requirement
              "{selectedItem?.requirement_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Requirement Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Requirement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRequirement)} className="space-y-4">
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
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 