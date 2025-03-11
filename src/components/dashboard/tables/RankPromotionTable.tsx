import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';

interface RankPromotion extends BaseItem {
  id: number;
  created_at: string;
  rank_id: number;
  kpi_id: number;
  requirement_id: number;
  target_count_house: number;
  target_count_condo: number;
  minimum_skillset_score: number;
  timeframe_days: number;
}

interface RankPromotionTableProps {
  isLoading: boolean;
}

export function RankPromotionTable({ isLoading }: RankPromotionTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RankPromotion[]>([]);
  
  // This would be fetched from the API in a real implementation
  const rankNames: Record<number, string> = {
    1: 'Rookie',
    2: 'Junior Agent',
    3: 'Senior Agent'
  };
  
  // This would be fetched from the API in a real implementation
  const kpiNames: Record<number, string> = {
    1: 'Sales Calls',
    2: 'Property Viewings',
    3: 'Contracts Signed'
  };
  
  // This would be fetched from the API in a real implementation
  const requirementNames: Record<number, string> = {
    1: 'Monthly Target',
    2: 'Quarterly Target',
    3: 'Annual Target'
  };

  const columns = [
    { 
      header: 'Rank', 
      accessor: 'rank_id' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <span>{rankNames[item.rank_id] || `Rank ID: ${item.rank_id}`}</span>
      )
    },
    { 
      header: 'KPI', 
      accessor: 'kpi_id' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <span>{kpiNames[item.kpi_id] || `KPI ID: ${item.kpi_id}`}</span>
      )
    },
    { 
      header: 'Requirement', 
      accessor: 'requirement_id' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <span>{requirementNames[item.requirement_id] || `Requirement ID: ${item.requirement_id}`}</span>
      )
    },
    { header: 'Target (House)', accessor: 'target_count_house' as keyof RankPromotion },
    { header: 'Target (Condo)', accessor: 'target_count_condo' as keyof RankPromotion },
    { header: 'Min. Skillset Score', accessor: 'minimum_skillset_score' as keyof RankPromotion },
    { header: 'Timeframe (Days)', accessor: 'timeframe_days' as keyof RankPromotion },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: RankPromotion) => {
    toast({
      title: 'Edit Rank Promotion Condition',
      description: `Editing condition for ${rankNames[item.rank_id] || `Rank ID: ${item.rank_id}`}`,
    });
  };

  const handleDelete = (item: RankPromotion) => {
    toast({
      title: 'Delete Rank Promotion Condition',
      description: `Are you sure you want to delete this condition?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: RankPromotion) => {
    toast({
      title: 'View Rank Promotion Condition',
      description: `Viewing details for condition ID: ${item.id}`,
    });
  };

  return (
    <BaseTable
      items={items}
      columns={columns}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      isLoading={isLoading}
      searchPlaceholder="Search rank promotion conditions..."
    />
  );
} 