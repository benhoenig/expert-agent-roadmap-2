import React, { useState, useEffect, useCallback } from 'react';
import { SalesCard } from '../SalesCard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { salesService, SalesUser } from '@/services/api/salesService';
import { weeklyDataService, WeekData, SummaryMetrics } from '@/services/api/weeklyDataService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Enhanced sales user with week data
interface EnhancedSalesUser {
  id: number;
  orderNumber: number;
  profileImage?: string;
  name: string;
  currentRank: string;
  weeksPassed: number;
  target100PercentWeeks: number;
  targetFailedWeeks: number;
  cohWarnings: number;
  weekData: any[];
}

/**
 * MySalesPage component for Mentor interface
 * 
 * Provides a dashboard interface to view performance of assigned sales agents
 * with inline mentor notes functionality
 */
export function MySalesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for filtering
  const [rankFilter, setRankFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for sales users list (used in dashboard view)
  const [salesUsers, setSalesUsers] = useState<EnhancedSalesUser[]>([]);
  
  // State for individual sales view (when looking at a specific sales user)
  const [salesData, setSalesData] = useState<SalesUser | null>(null);
  const [weeksData, setWeeksData] = useState<WeekData[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
    weeksPassed: 0,
    target100PercentWeeks: 0,
    targetFailedWeeks: 0,
    cohWarnings: 0
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get the current user's mentor ID
  const mentorId = user?.mentor_id || 1; // Fallback to 1 for development
  
  // For individual sales view, we would use a salesId
  // In a real app, this would come from a route parameter
  const salesId = 2; // Example hardcoded ID, would come from route in real app
  
  console.log('[MySalesPage] Using mentor ID:', mentorId);
  
  // Fetch sales data function - extracted to be reusable
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        console.log(`[MySalesPage] Force refreshing data for sales ID ${salesId}`);
      } else {
        console.log(`[MySalesPage] Fetching data for sales ID ${salesId}`);
        setIsLoading(true);
      }

      // Get the sales data
      const salesRecord = await salesService.getSalesById(salesId, 
        forceRefresh ? { forceRefresh: true } : undefined
      );
      
      if (!salesRecord) {
        throw new Error(`Sales record with ID ${salesId} not found`);
      }
      
      console.log(`[MySalesPage] Received sales record for ID ${salesId}`);
      setSalesData(salesRecord);
      
      // Get weeks data (with a small delay to avoid rate limits)
      let weekData;
      try {
        console.log(`[MySalesPage] Fetching week data for sales ID ${salesId}`);
        weekData = await weeklyDataService.getWeeksBySalesId(
          salesId, 
          forceRefresh ? { forceRefresh: true } : undefined
        );
      } catch (error) {
        console.error(`[MySalesPage] Error fetching week data:`, error);
        weekData = []; // Use empty array as fallback
        toast({
          title: 'Warning',
          description: 'Could not load weekly data. Some information may be missing.',
          variant: 'destructive',
        });
      }
      
      console.log(`[MySalesPage] Received ${weekData.length} weeks of data`);
      setWeeksData(weekData);
      
      // Get summary metrics (with a small delay to avoid rate limits)
      try {
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`[MySalesPage] Fetching summary metrics for sales ID ${salesId}`);
        const metrics = await weeklyDataService.getSalesSummaryMetrics(
          salesId,
          forceRefresh ? { forceRefresh: true } : undefined
        );
        setSummaryMetrics(metrics);
      } catch (error) {
        console.error(`[MySalesPage] Error fetching summary metrics:`, error);
        // Use default values as fallback
        setSummaryMetrics({
          weeksPassed: 0,
          target100PercentWeeks: 0,
          targetFailedWeeks: 0,
          cohWarnings: 0
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('[MySalesPage] Error fetching sales data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch sales data',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [salesId, toast]);
  
  // Fetch mentor's sales users for the dashboard view
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      console.log(`[MySalesPage] ${forceRefresh ? 'Force refreshing' : 'Fetching'} dashboard data for mentor ID ${mentorId}`);
      setIsLoading(true);
      
      // Get all sales users for this mentor with real data
      const salesData = await salesService.getDashboardSalesByMentor(
        mentorId,
        forceRefresh ? { forceRefresh: true } : undefined
      );
      console.log(`[MySalesPage] Received ${salesData.length} sales records for dashboard`);
      
      // Process sales users sequentially to avoid rate limits
      const enhancedSalesData: EnhancedSalesUser[] = [];
      
      for (const salesUser of salesData) {
        try {
          console.log(`[MySalesPage] Processing dashboard data for sales ID ${salesUser.id}`);
          
          // First get week data
          let weekData;
          try {
            weekData = await weeklyDataService.getWeeksBySalesId(
              salesUser.id, 
              forceRefresh ? { forceRefresh: true } : undefined
            );
          } catch (error) {
            console.error(`[MySalesPage] Error fetching week data for sales ID ${salesUser.id}:`, error);
            weekData = []; // Use empty array as fallback
          }
          
          // Then get summary metrics
          let summaryMetrics;
          try {
            summaryMetrics = await weeklyDataService.getSalesSummaryMetrics(
              salesUser.id,
              forceRefresh ? { forceRefresh: true } : undefined
            );
          } catch (error) {
            console.error(`[MySalesPage] Error fetching summary metrics for sales ID ${salesUser.id}:`, error);
            // Use default values as fallback
            summaryMetrics = {
              weeksPassed: 0,
              target100PercentWeeks: 0,
              targetFailedWeeks: 0,
              cohWarnings: 0
            };
          }
          
          // Add to our results array
          enhancedSalesData.push({
            ...salesUser,
            ...summaryMetrics,
            weekData
          });
          
          // Add a small delay between processing sales users to avoid overwhelming the API
          if (salesData.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error(`[MySalesPage] Error processing sales user ${salesUser.id}:`, error);
          // Skip this sales user but continue with others
        }
      }
      
      console.log(`[MySalesPage] Setting state with ${enhancedSalesData.length} enhanced sales records`);
      setSalesUsers(enhancedSalesData);
      return true;
    } catch (error: any) {
      console.error('[MySalesPage] Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mentorId, toast]);

  // Initial data fetch
  useEffect(() => {
    if (mentorId) {
      fetchDashboardData();
    }
  }, [mentorId, fetchDashboardData]);
  
  // Handle tab change
  useEffect(() => {
    if (activeTab === 'dashboard' && mentorId) {
      // Only fetch data when switching to dashboard tab and we have a mentor ID
      fetchDashboardData();
    }
  }, [activeTab, mentorId, fetchDashboardData]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    console.log('[MySalesPage] Refresh button clicked - forcing data refresh');
    setIsRefreshing(true);
    
    if (activeTab === 'dashboard') {
      fetchDashboardData(true).then(success => {
        if (success) {
          toast({
            title: 'Refreshed',
            description: 'Dashboard data has been refreshed',
          });
        }
      });
    } else {
      // Handle other tabs' refresh if needed in the future
      toast({
        title: 'Refreshed',
        description: 'Data has been refreshed',
      });
      setIsRefreshing(false);
    }
  };
  
  // Filter sales data based on selected rank and search query
  const filteredSalesData = salesUsers.filter(sale => {
    // Filter by rank
    const rankMatch = rankFilter === 'all' || sale.currentRank.toLowerCase() === rankFilter.toLowerCase();
    
    // Filter by search query (match against name)
    const searchMatch = sale.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return rankMatch && searchMatch;
  });
  
  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Sales</h1>
        
        {/* Refresh button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
       {/* Tab Navigation */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList>
           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
           <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
         </TabsList>
       </Tabs>
       
       {activeTab === 'dashboard' ? (
         <>
           {/* Filters */}
           <div className="flex flex-col sm:flex-row gap-2 mb-3 mt-4">
             <div className="relative flex-1">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Search sales agents..."
                 className="pl-8"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <Select value={rankFilter} onValueChange={setRankFilter}>
               <SelectTrigger className="w-full sm:w-[180px]">
                 <SelectValue placeholder="Filter by rank" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Ranks</SelectItem>
                 <SelectItem value="trainee">Trainee</SelectItem>
                 <SelectItem value="new list finder">New List Finder</SelectItem>
                 <SelectItem value="real estate consultant">Real Estate Consultant</SelectItem>
               </SelectContent>
             </Select>
           </div>
           
           {/* Loading state */}
           {isLoading && !isRefreshing ? (
             <div className="flex items-center justify-center h-64">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
           ) : (
             /* Sales Cards Grid */
             filteredSalesData.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                 {filteredSalesData.map((sale) => (
                   <SalesCard
                     key={sale.id}
                     id={sale.id}
                     orderNumber={sale.orderNumber}
                     name={sale.name}
                     profileImage={sale.profileImage}
                     currentRank={sale.currentRank}
                     weeksPassed={sale.weeksPassed}
                     target100PercentWeeks={sale.target100PercentWeeks}
                     targetFailedWeeks={sale.targetFailedWeeks}
                     cohWarnings={sale.cohWarnings}
                     weekData={sale.weekData}
                   />
                 ))}
               </div>
             ) : (
               <div className="text-center py-6 text-muted-foreground">
                 No sales agents found matching your filters.
               </div>
             )
           )}
         </>
       ) : (
         // Action Plan tab content (empty for now)
         <div className="flex items-center justify-center h-64 border rounded-md mt-4">
           <p className="text-muted-foreground">Action Plan content coming soon...</p>
         </div>
       )}
    </div>
  );
}

export default MySalesPage; 