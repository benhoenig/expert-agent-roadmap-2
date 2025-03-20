import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { xanoService } from '@/services/xanoService';

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(false);
  const [salesId, setSalesId] = useState('1');
  const [mentorId, setMentorId] = useState('1');
  const [results, setResults] = useState<any>(null);
  const [testValue, setTestValue] = useState<string>('null');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      // Get sales table information
      const salesTableInfo = await xanoService.getSalesTableInfo();
      setResults(salesTableInfo);
      console.log('Diagnostics results:', salesTableInfo);
      
      toast({
        title: 'Success',
        description: 'Diagnostics completed successfully',
      });
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast({
        title: 'Error',
        description: `Failed to run diagnostics: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testMentorAssignment = async () => {
    setTestLoading(true);
    try {
      // Parse the test value
      let parsedValue;
      if (testValue === 'null') parsedValue = null;
      else if (testValue === 'undefined') parsedValue = undefined;
      else if (testValue === '""') parsedValue = "";
      else if (testValue === '0') parsedValue = 0;
      else if (testValue === 'number') parsedValue = Number(mentorId);
      else if (testValue === 'string') parsedValue = String(mentorId);
      else parsedValue = testValue;

      console.log(`Testing mentor_id assignment with value: ${parsedValue} (${typeof parsedValue})`);
      
      // Make the assignment
      const numericSalesId = Number(salesId);
      if (isNaN(numericSalesId)) {
        throw new Error('Invalid sales ID');
      }
      
      let response;
      if (parsedValue === null || parsedValue === "" || parsedValue === 0) {
        // Unassign mentor
        response = await xanoService.unassignMentorFromSales(numericSalesId);
      } else {
        // Assign mentor
        const numericMentorId = Number(mentorId);
        if (isNaN(numericMentorId)) {
          throw new Error('Invalid mentor ID');
        }
        response = await xanoService.assignMentorToSales(numericSalesId, numericMentorId);
      }
      
      setTestResponse({
        success: true,
        data: response,
        value: parsedValue,
        valueType: typeof parsedValue
      });
      
      toast({
        title: 'Success',
        description: `Successfully ${parsedValue ? 'assigned' : 'unassigned'} mentor_id=${parsedValue} to sales ID ${salesId}`,
      });
    } catch (error) {
      console.error('Error testing mentor assignment:', error);
      setTestResponse({
        success: false,
        error: error.message,
        stack: error.stack
      });
      toast({
        title: 'Error',
        description: `Failed to test mentor assignment: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Diagnostics</h1>
      
      <Tabs defaultValue="mentor-assignment">
        <TabsList className="mb-4">
          <TabsTrigger value="mentor-assignment">Mentor Assignment</TabsTrigger>
          <TabsTrigger value="table-info">Table Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mentor-assignment">
          <Card>
            <CardHeader>
              <CardTitle>Test Mentor Assignment</CardTitle>
              <CardDescription>
                Test different values for mentor_id to diagnose assignment issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salesId">Sales ID</Label>
                    <Input 
                      id="salesId" 
                      value={salesId} 
                      onChange={(e) => setSalesId(e.target.value)} 
                      placeholder="Sales ID to test" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="mentorId">Mentor ID</Label>
                    <Input 
                      id="mentorId" 
                      value={mentorId} 
                      onChange={(e) => setMentorId(e.target.value)} 
                      placeholder="Mentor ID to assign" 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="testValue">Test Value Type</Label>
                  <select 
                    id="testValue"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={testValue}
                    onChange={(e) => setTestValue(e.target.value)}
                  >
                    <option value="null">null</option>
                    <option value="undefined">undefined</option>
                    <option value='""'>empty string ("")</option>
                    <option value="0">0 (zero)</option>
                    <option value="number">Number (from Mentor ID)</option>
                    <option value="string">String (from Mentor ID)</option>
                  </select>
                </div>
                
                <Button onClick={testMentorAssignment} disabled={testLoading}>
                  {testLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Assignment'
                  )}
                </Button>
                
                {testResponse && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-sm">
                        {JSON.stringify(testResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table-info">
          <Card>
            <CardHeader>
              <CardTitle>Sales Table Information</CardTitle>
              <CardDescription>
                Run diagnostics to examine the sales table structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="diagnosticsSalesId">Sales ID for Diagnostics</Label>
                  <Input 
                    id="diagnosticsSalesId" 
                    value={salesId} 
                    onChange={(e) => setSalesId(e.target.value)} 
                    placeholder="Sales ID to use for diagnostics" 
                  />
                </div>
                
                <Button onClick={runDiagnostics} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Diagnostics...
                    </>
                  ) : (
                    'Run Diagnostics'
                  )}
                </Button>
                
                {results && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Diagnostics Results</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-sm">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 