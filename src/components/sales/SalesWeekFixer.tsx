import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { xanoService } from '@/services/xanoService';
import { Loader2 } from 'lucide-react';

interface FixResult {
  salesId: number;
  weeksExisted: number;
  weeksGenerated: number;
  errors: number;
  success: boolean;
}

/**
 * Component for fixing week records for sales users
 * This can be used by admins to fix week generation issues
 */
export function SalesWeekFixer() {
  const [salesId, setSalesId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixWeeks = async () => {
    // Reset state
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    // Parse sales ID
    const id = parseInt(salesId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid sales ID');
      setIsLoading(false);
      return;
    }
    
    try {
      // Call the service function
      const response = await xanoService.checkAndGenerateWeeksForSales(id);
      
      // Update result
      setResult({
        ...response,
        success: response.weeksExisted === 12 || response.weeksGenerated > 0
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Fix Sales Week Records</CardTitle>
        <CardDescription>
          Generate missing week records for a sales user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="salesId">Sales ID</Label>
            <Input
              id="salesId"
              placeholder="Enter sales ID"
              value={salesId}
              onChange={(e) => setSalesId(e.target.value)}
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
            <AlertTitle>{result.success ? "Success" : "Warning"}</AlertTitle>
            <AlertDescription>
              <p><strong>Sales ID:</strong> {result.salesId}</p>
              <p><strong>Existing Weeks:</strong> {result.weeksExisted}</p>
              <p><strong>Weeks Generated:</strong> {result.weeksGenerated}</p>
              <p><strong>Errors:</strong> {result.errors}</p>
              <p className="mt-2 font-semibold">
                {result.weeksExisted === 12 
                  ? "All weeks already exist" 
                  : result.weeksGenerated > 0 
                    ? `Generated ${result.weeksGenerated} missing weeks` 
                    : "Failed to generate any weeks"}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleFixWeeks} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing...
            </>
          ) : (
            'Fix Weeks'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 