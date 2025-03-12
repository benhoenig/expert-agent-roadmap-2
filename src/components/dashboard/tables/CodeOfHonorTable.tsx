import { useState, useEffect } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';
import { 
  codeOfHonorService, 
  CodeOfHonor as CodeOfHonorType 
} from '../../../services/codeOfHonorService';
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

interface CodeOfHonorTableProps {
  isLoading: boolean;
}

// Code of Honor form schema
const codeOfHonorSchema = z.object({
  code_of_honor_name: z.string().min(1, "Code of Honor name is required"),
  explanation: z.string().min(1, "Explanation is required"),
});

type CodeOfHonorFormValues = z.infer<typeof codeOfHonorSchema>;

export function CodeOfHonorTable({ isLoading: externalLoading }: CodeOfHonorTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<CodeOfHonorType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CodeOfHonorType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create the form
  const form = useForm<CodeOfHonorFormValues>({
    resolver: zodResolver(codeOfHonorSchema),
    defaultValues: {
      code_of_honor_name: "",
      explanation: "",
    },
  });

  // Update form values when selected item changes
  useEffect(() => {
    if (selectedItem) {
      form.setValue("code_of_honor_name", selectedItem.code_of_honor_name);
      form.setValue("explanation", selectedItem.explanation);
    }
  }, [selectedItem, form]);

  // Fetch code of honor records on component mount
  useEffect(() => {
    fetchCodeOfHonors();
  }, []);

  // Fetch code of honor records from the API
  const fetchCodeOfHonors = async () => {
    setIsLoading(true);
    try {
      const codeOfHonors = await codeOfHonorService.getAllCodeOfHonors();
      setItems(codeOfHonors);
    } catch (error: any) {
      console.error('Error fetching code of honor records:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch code of honor records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Code of Honor Name', accessor: 'code_of_honor_name' as keyof CodeOfHonorType },
    { 
      header: 'Explanation', 
      accessor: 'explanation' as keyof CodeOfHonorType,
      cell: (item: CodeOfHonorType) => (
        <div className="max-w-md truncate" title={item.explanation}>
          {item.explanation}
        </div>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof CodeOfHonorType,
      cell: (item: CodeOfHonorType) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: CodeOfHonorType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: CodeOfHonorType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (item: CodeOfHonorType) => {
    toast({
      title: 'View Code of Honor',
      description: `Viewing details for ${item.code_of_honor_name}`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await codeOfHonorService.deleteCodeOfHonor(selectedItem.id);
      toast({
        title: 'Success',
        description: `Code of Honor "${selectedItem.code_of_honor_name}" has been deleted.`,
      });
      // Refresh the code of honor list
      fetchCodeOfHonors();
    } catch (error: any) {
      console.error('Error deleting code of honor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete code of honor',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateCodeOfHonor = async (data: CodeOfHonorFormValues) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await codeOfHonorService.updateCodeOfHonor(selectedItem.id, data);
      toast({
        title: 'Success',
        description: `Code of Honor "${selectedItem.code_of_honor_name}" has been updated.`,
      });
      // Refresh the code of honor list
      fetchCodeOfHonors();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating code of honor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update code of honor',
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
        searchPlaceholder="Search code of honor..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the code of honor
              "{selectedItem?.code_of_honor_name}".
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

      {/* Edit Code of Honor Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Code of Honor</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateCodeOfHonor)} className="space-y-4">
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