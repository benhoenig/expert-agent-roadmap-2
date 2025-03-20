import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { weeklyDataService } from "@/services/api/weeklyDataService";
import { kpiService, Kpi } from "@/services/api/kpiService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

// Define schema for form validation
const formSchema = z.object({
  kpi_id: z.string().min(1, { message: "Please select a KPI" }),
  count: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) || '' : val),
    z.number({ required_error: "Please enter count" }).min(1, { message: "Count must be at least 1" })
  ),
  date: z.date({ required_error: "Please select a date" }),
  remark: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface KPIFormProps {
  onSuccess: () => void;
}

export function KPIForm({ onSuccess }: KPIFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpi[]>([]);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpi_id: "",
      count: 1,
      date: new Date(),
      remark: ""
    }
  });

  // Fetch KPIs on component mount
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const kpisData = await kpiService.getAllKpis();
        // Filter only Action type KPIs
        setKpis(kpisData.filter(kpi => kpi.kpi_type === 'Action'));
      } catch (error) {
        console.error("Error fetching KPIs:", error);
        toast({
          title: "Error",
          description: "Failed to load KPIs. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
  }, [toast]);

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    if (!user?.salesId) {
      toast({
        title: "Error",
        description: "You must be a sales user to add KPI actions.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse kpi_id to a number explicitly
      const kpiId = parseInt(values.kpi_id, 10);
      
      // Use the submitKpiAction function
      await weeklyDataService.submitKpiAction(
        user.salesId,
        kpiId,
        // Add one day to compensate for timezone shift
        format(new Date(values.date.getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        values.count,
        values.remark
      );
      
      toast({
        title: "Success",
        description: "KPI action added successfully.",
      });
      
      // Reset form
      form.reset({
        kpi_id: "",
        count: 1,
        date: new Date(),
        remark: ""
      });
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting KPI action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add KPI action. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="kpi_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI Action</FormLabel>
              <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select KPI Action" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {kpis.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.id.toString()}>
                      {kpi.kpi_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Count</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter count" 
                  {...field} 
                  min="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      type="button"
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
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional details" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit KPI Action"}
        </Button>
      </form>
    </Form>
  );
} 