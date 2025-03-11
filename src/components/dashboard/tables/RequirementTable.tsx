import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';

interface Requirement extends BaseItem {
  id: number;
  created_at: string;
  requirement_name: string;
}

interface RequirementTableProps {
  isLoading: boolean;
}

export function RequirementTable({ isLoading }: RequirementTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Requirement[]>([]);

  const columns = [
    { header: 'Requirement Name', accessor: 'requirement_name' as keyof Requirement },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof Requirement,
      cell: (item: Requirement) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: Requirement) => {
    toast({
      title: 'Edit Requirement',
      description: `Editing ${item.requirement_name}`,
    });
  };

  const handleDelete = (item: Requirement) => {
    toast({
      title: 'Delete Requirement',
      description: `Are you sure you want to delete ${item.requirement_name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: Requirement) => {
    toast({
      title: 'View Requirement',
      description: `Viewing details for ${item.requirement_name}`,
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