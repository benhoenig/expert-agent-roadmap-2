import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { kpiService, KpiType, Kpi } from '@/services/api/kpiService';
import { useToast } from '@/components/ui/use-toast';

interface KpiGroupProps {
  title: string;
  kpis: Kpi[];
}

/**
 * Displays a group of KPIs with a title
 */
function KpiGroup({ title, kpis }: KpiGroupProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {kpis.length > 0 ? (
        <ul className="space-y-1">
          {kpis.map((kpi) => (
            <li key={kpi.id} className="flex items-start">
              <span className="mr-2 text-sm">▪️</span>
              <span>{kpi.kpi_name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">No {title.toLowerCase()} KPIs found.</p>
      )}
    </div>
  );
}

/**
 * ActionPlanTab component for displaying KPIs grouped by type
 */
export function ActionPlanTab() {
  const [actionKpis, setActionKpis] = useState<Kpi[]>([]);
  const [skillsetKpis, setSkillsetKpis] = useState<Kpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoading(true);
        
        // Fetch KPIs by type
        const [actionKpisData, skillsetKpisData] = await Promise.all([
          kpiService.getKpisByType('ACTION'),
          kpiService.getKpisByType('SKILLSET')
        ]);
        
        setActionKpis(actionKpisData);
        setSkillsetKpis(skillsetKpisData);
      } catch (error: any) {
        console.error('[ActionPlanTab] Error fetching KPIs:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch KPIs',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKpis();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <KpiGroup title="Action" kpis={actionKpis} />
        </div>
        
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <KpiGroup title="Skillset" kpis={skillsetKpis} />
        </div>
      </div>
    </div>
  );
}

export default ActionPlanTab; 