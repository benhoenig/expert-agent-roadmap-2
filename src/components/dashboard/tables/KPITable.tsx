import { useState, useEffect } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';
import { KPI, kpiService, UpdateKPIRequest } from '../../../services/kpiService';
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
  FormMessage 
} from "../../ui/form";
import { Input } from "../../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

interface KPITableProps {
  isLoading: boolean;
}

// KPI form schema
const kpiSchema = z.object({
  kpi_name: z.string().min(1, "KPI name is required"),
  kpi_type: z.enum(["Action", "Skillset"], {
    required_error: "KPI type is required",
  }),
});

export function KPITable({ isLoading: initialLoading }: KPITableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create the form
  const form = useForm({
    resolver: zodResolver(kpiSchema),
    defaultValues: {
      kpi_name: "",
      kpi_type: "Action" as "Action" | "Skillset",
    },
  });

  // Reset form when selected KPI changes
  useEffect(() => {
    if (selectedKPI) {
      form.reset({
        kpi_name: selectedKPI.kpi_name,
        kpi_type: selectedKPI.kpi_type,
      });
    }
  }, [selectedKPI, form]);

  // Fetch KPIs on component mount
  useEffect(() => {
    fetchKPIs();
  }, []);

  // Function to fetch KPIs
  const fetchKPIs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await kpiService.getAllKPIs();
      setItems(data);
    } catch (err: any) {
      console.error('Failed to fetch KPIs:', err);
      setError(err.message || 'Failed to fetch KPIs');
      toast({
        title: 'Error',
        description: 'Failed to fetch KPIs. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Action':
        return 'default';
      case 'Skillset':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns = [
    { header: 'KPI Name', accessor: 'kpi_name' as keyof KPI },
    { 
      header: 'Type', 
      accessor: 'kpi_type' as keyof KPI,
      cell: (item: KPI) => (
        <Badge variant={getTypeVariant(item.kpi_type)}>
          {item.kpi_type}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof KPI,
      cell: (item: KPI) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = async (item: KPI) => {
    setSelectedKPI(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedKPI(null);
  };

  const handleSubmitEdit = async (data: z.infer<typeof kpiSchema>) => {
    if (!selectedKPI) return;
    
    setIsSubmitting(true);
    console.log('Starting KPI update with data:', data);
    console.log('Selected KPI to update:', selectedKPI);
    
    try {
      const updateData: UpdateKPIRequest = {
        kpi_name: data.kpi_name,
        kpi_type: data.kpi_type
      };
      
      console.log('Sending update request with data:', updateData);
      const updatedKPI = await kpiService.updateKPI(selectedKPI.id, updateData);
      console.log('KPI updated successfully:', updatedKPI);
      
      toast({
        title: 'Success',
        description: `KPI "${data.kpi_name}" has been updated.`,
      });
      
      // Refresh the KPI list
      fetchKPIs();
      
      // Close the modal
      handleCloseEditModal();
    } catch (err: any) {
      console.error('Failed to update KPI:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update KPI',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: KPI) => {
    if (window.confirm(`Are you sure you want to delete ${item.kpi_name}?`)) {
      setIsLoading(true);
      try {
        await kpiService.deleteKPI(item.id);
        toast({
          title: 'Success',
          description: `${item.kpi_name} has been deleted.`,
        });
        // Refresh the KPI list
        fetchKPIs();
      } catch (err: any) {
        console.error('Failed to delete KPI:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete KPI',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleView = (item: KPI) => {
    toast({
      title: 'View KPI',
      description: `Viewing details for ${item.kpi_name}`,
    });
    // In a real implementation, this would open a modal for viewing details
  };

  return (
    <div>
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md mb-4 text-destructive">
          {error}
        </div>
      )}
      <BaseTable
        items={items}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
        searchPlaceholder="Search KPIs..."
      />
      
      {/* Edit KPI Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit KPI</DialogTitle>
            <DialogDescription>
              Update the KPI details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitEdit)} className="space-y-4">
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 