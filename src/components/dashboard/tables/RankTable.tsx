import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface Rank extends BaseItem {
  name: string;
  level: number;
  benefits: string;
  status: 'Active' | 'Inactive';
}

interface RankTableProps {
  isLoading: boolean;
}

export function RankTable({ isLoading }: RankTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Rank[]>([]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Rank },
    { header: 'Level', accessor: 'level' as keyof Rank },
    { 
      header: 'Benefits', 
      accessor: 'benefits' as keyof Rank,
      cell: (item: Rank) => (
        <div className="max-w-md truncate" title={item.benefits}>
          {item.benefits}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof Rank,
      cell: (item: Rank) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: Rank) => {
    toast({
      title: 'Edit Rank',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: Rank) => {
    toast({
      title: 'Delete Rank',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: Rank) => {
    toast({
      title: 'View Rank',
      description: `Viewing details for ${item.name}`,
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