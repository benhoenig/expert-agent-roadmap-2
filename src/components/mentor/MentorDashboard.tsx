import React, { useState, useEffect, useCallback } from 'react';
import { 
  salesService, 
  weeklyDataService, 
  DashboardSalesUser as ApiDashboardSalesUser,
  WeekData,
  SummaryMetrics
} from '@/services/api';
import { SalesCard } from './SalesCard';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enhanced sales user with week data
interface EnhancedSalesUser extends ApiDashboardSalesUser {
  weekData: WeekData[];
}

interface MentorDashboardProps {
  mentorId: number;
}

export function MentorDashboard({ mentorId }: MentorDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<EnhancedSalesUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch sales data function - extracted to be reusable
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        console.log(`[MentorDashboard] Force refreshing data for mentor ID ${mentorId}`);
      } else {
        console.log(`[MentorDashboard] Fetching data for mentor ID ${mentorId}`);
        setIsLoading(true);
      }
      
      // Get all sales users for this mentor with real data
      // When refreshing, bypass cache by setting forceRefresh
      const salesData = await salesService.getDashboardSalesByMentor(
        mentorId, 
        forceRefresh ? { forceRefresh: true } : undefined
      );
      
      console.log(`[MentorDashboard] Received ${salesData.length} sales records`);
      
      if (salesData.length === 0) {
        setSalesUsers([]);
        return true;
      }
      
      // Process sales users sequentially to avoid rate limits
      const enhancedSalesData: EnhancedSalesUser[] = [];
      
      for (const salesUser of salesData) {
        try {
          console.log(`[MentorDashboard] Processing sales user ID ${salesUser.id}, name: "${salesUser.name}", original display_name: "${salesUser.display_name}"`);
          
          // First get week data
          let weekData;
          try {
            weekData = await weeklyDataService.getWeeksBySalesId(
              salesUser.id, 
              forceRefresh ? { forceRefresh: true } : undefined
            );
          } catch (error) {
            console.error(`[MentorDashboard] Error fetching week data for sales ID ${salesUser.id}:`, error);
            weekData = []; // Use empty array as fallback
          }
          
          // Then get probation progress for summary metrics
          let summaryMetrics;
          try {
            // Use the new probation progress function
            const probationProgress = await weeklyDataService.getProbationProgress(
              salesUser.id,
              forceRefresh ? { forceRefresh: true } : undefined
            );
            
            // Extract the metrics we need
            summaryMetrics = {
              weeksPassed: probationProgress.weeks_completed,
              target100PercentWeeks: probationProgress.weeks_successful,
              targetFailedWeeks: probationProgress.weeks_completed - probationProgress.weeks_successful,
              cohWarnings: 0 // This will be calculated separately
            };
            
            console.log(`[MentorDashboard] Fetched probation progress for sales ID ${salesUser.id}: completed ${summaryMetrics.weeksPassed}, successful ${summaryMetrics.target100PercentWeeks}`);
          } catch (error) {
            console.error(`[MentorDashboard] Error fetching probation progress for sales ID ${salesUser.id}:`, error);
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
          console.error(`[MentorDashboard] Error processing sales user ${salesUser.id}:`, error);
          // Skip this sales user but continue with others
        }
      }
      
      console.log(`[MentorDashboard] Setting state with ${enhancedSalesData.length} enhanced sales records`);
      setSalesUsers(enhancedSalesData);
      return true;
    } catch (error: any) {
      console.error('[MentorDashboard] Error fetching sales data:', error);
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
  }, [mentorId, toast]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [mentorId, fetchData]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('[MentorDashboard] Refresh button clicked');
    const success = await fetchData(true); // Pass true to force refresh
    
    if (success) {
      toast({
        title: 'Dashboard refreshed',
        description: 'The latest sales data has been loaded.',
        variant: 'default',
      });
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
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
      
      {/* Sales cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesUsers.length > 0 ? (
          salesUsers.map((user) => (
            <SalesCard
              key={user.id}
              id={user.id}
              orderNumber={user.orderNumber}
              profileImage={user.profileImage}
              name={user.name}
              currentRank={user.currentRank}
              weeksPassed={user.weeksPassed}
              target100PercentWeeks={user.target100PercentWeeks}
              targetFailedWeeks={user.targetFailedWeeks}
              cohWarnings={user.cohWarnings}
              weekData={user.weekData}
            />
          ))
        ) : (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            No sales users assigned to you yet.
          </div>
        )}
      </div>
    </div>
  );
} 