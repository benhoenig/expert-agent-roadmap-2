import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface Requirement extends BaseItem {
  name: string;
  category: string;
  threshold: number;
  rank: string;
  status: 'Active' | 'Inactive';
}

interface RequirementTableProps {
  isLoading: boolean;
}

export function RequirementTable({ isLoading }: RequirementTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Requirement[]>([]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Requirement },
    { header: 'Category', accessor: 'category' as keyof Requirement },
    { header: 'Threshold', accessor: 'threshold' as keyof Requirement },
    { header: 'Rank', accessor: 'rank' as keyof Requirement },
    { 
      header: 'Status', 
      accessor: 'status' as keyof Requirement,
      cell: (item: Requirement) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: Requirement) => {
    toast({
      title: 'Edit Requirement',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: Requirement) => {
    toast({
      title: 'Delete Requirement',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: Requirement) => {
    toast({
      title: 'View Requirement',
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
      searchPlaceholder="Search requirements..."
    />
  );
} 