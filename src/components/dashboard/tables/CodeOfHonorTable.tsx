import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface CodeOfHonor extends BaseItem {
  name: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface CodeOfHonorTableProps {
  isLoading: boolean;
}

export function CodeOfHonorTable({ isLoading }: CodeOfHonorTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<CodeOfHonor[]>([]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof CodeOfHonor },
    { header: 'Category', accessor: 'category' as keyof CodeOfHonor },
    { 
      header: 'Description', 
      accessor: 'description' as keyof CodeOfHonor,
      cell: (item: CodeOfHonor) => (
        <div className="max-w-md truncate" title={item.description}>
          {item.description}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof CodeOfHonor,
      cell: (item: CodeOfHonor) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: CodeOfHonor) => {
    toast({
      title: 'Edit Code of Honor',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: CodeOfHonor) => {
    toast({
      title: 'Delete Code of Honor',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: CodeOfHonor) => {
    toast({
      title: 'View Code of Honor',
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
      searchPlaceholder="Search code of honor..."
    />
  );
} 