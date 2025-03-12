import { useState, useEffect } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';
import { 
  rankService, 
  Rank as RankType 
} from '../../../services/rankService';
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

interface RankTableProps {
  isLoading: boolean;
}

// Rank form schema
const rankSchema = z.object({
  rank_name: z.string().min(1, "Rank name is required"),
  rank_level: z.coerce.number().min(1, "Rank level must be at least 1"),
  manual_promotion: z.boolean().default(false),
  time_requirement_months: z.coerce.number().min(0, "Time requirement must be at least 0"),
});

type RankFormValues = z.infer<typeof rankSchema>;

export function RankTable({ isLoading: externalLoading }: RankTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RankType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RankType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create the form
  const form = useForm<RankFormValues>({
    resolver: zodResolver(rankSchema),
    defaultValues: {
      rank_name: "",
      rank_level: 1,
      manual_promotion: false,
      time_requirement_months: 0,
    },
  });

  // Update form values when selected item changes
  useEffect(() => {
    if (selectedItem) {
      form.setValue("rank_name", selectedItem.rank_name);
      form.setValue("rank_level", selectedItem.rank_level);
      form.setValue("manual_promotion", selectedItem.manual_promotion);
      form.setValue("time_requirement_months", selectedItem.time_requirement_months);
    }
  }, [selectedItem, form]);

  // Fetch ranks on component mount
  useEffect(() => {
    fetchRanks();
  }, []);

  // Fetch ranks from the API
  const fetchRanks = async () => {
    setIsLoading(true);
    try {
      const ranks = await rankService.getAllRanks();
      setItems(ranks);
    } catch (error: any) {
      console.error('Error fetching ranks:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch ranks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'Rank Name', accessor: 'rank_name' as keyof RankType },
    { header: 'Level', accessor: 'rank_level' as keyof RankType },
    { header: 'Time Requirement (Months)', accessor: 'time_requirement_months' as keyof RankType },
    { 
      header: 'Manual Promotion', 
      accessor: 'manual_promotion' as keyof RankType,
      cell: (item: RankType) => (
        <Badge variant={item.manual_promotion ? 'default' : 'secondary'}>
          {item.manual_promotion ? 'Yes' : 'No'}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof RankType,
      cell: (item: RankType) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: RankType) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: RankType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (item: RankType) => {
    toast({
      title: 'View Rank',
      description: `Viewing details for ${item.rank_name}`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await rankService.deleteRank(selectedItem.id);
      toast({
        title: 'Success',
        description: `Rank "${selectedItem.rank_name}" has been deleted.`,
      });
      // Refresh the ranks list
      fetchRanks();
    } catch (error: any) {
      console.error('Error deleting rank:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete rank',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateRank = async (data: RankFormValues) => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      await rankService.updateRank(selectedItem.id, data);
      toast({
        title: 'Success',
        description: `Rank "${selectedItem.rank_name}" has been updated.`,
      });
      // Refresh the ranks list
      fetchRanks();
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating rank:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rank',
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
        searchPlaceholder="Search ranks..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the rank
              "{selectedItem?.rank_name}".
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

      {/* Edit Rank Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Rank</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRank)} className="space-y-4">
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
                        min={1} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The level of this rank (higher number = higher rank)
                    </FormDescription>
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
                        placeholder="Enter time requirement" 
                        min={0} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum time in months required before promotion
                    </FormDescription>
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
                        If checked, promotion to this rank requires manual approval
                      </FormDescription>
                    </div>
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