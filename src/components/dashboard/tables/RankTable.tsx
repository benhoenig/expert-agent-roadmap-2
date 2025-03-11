import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface Rank extends BaseItem {
  id: number;
  created_at: string;
  rank_name: string;
  rank_level: number;
  manual_promotion: boolean;
  time_requirement_months: number;
}

interface RankTableProps {
  isLoading: boolean;
}

export function RankTable({ isLoading }: RankTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Rank[]>([]);

  const columns = [
    { header: 'Rank Name', accessor: 'rank_name' as keyof Rank },
    { header: 'Level', accessor: 'rank_level' as keyof Rank },
    { header: 'Time Requirement (Months)', accessor: 'time_requirement_months' as keyof Rank },
    { 
      header: 'Manual Promotion', 
      accessor: 'manual_promotion' as keyof Rank,
      cell: (item: Rank) => (
        <Badge variant={item.manual_promotion ? 'default' : 'secondary'}>
          {item.manual_promotion ? 'Yes' : 'No'}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof Rank,
      cell: (item: Rank) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: Rank) => {
    toast({
      title: 'Edit Rank',
      description: `Editing ${item.rank_name}`,
    });
  };

  const handleDelete = (item: Rank) => {
    toast({
      title: 'Delete Rank',
      description: `Are you sure you want to delete ${item.rank_name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: Rank) => {
    toast({
      title: 'View Rank',
      description: `Viewing details for ${item.rank_name}`,
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
      searchPlaceholder="Search ranks..."
    />
  );
} 