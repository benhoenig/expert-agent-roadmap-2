import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { useToast } from '../../ui/use-toast';

interface CodeOfHonor extends BaseItem {
  id: number;
  created_at: string;
  code_of_honor_name: string;
  explanation: string;
}

interface CodeOfHonorTableProps {
  isLoading: boolean;
}

export function CodeOfHonorTable({ isLoading }: CodeOfHonorTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<CodeOfHonor[]>([]);

  const columns = [
    { header: 'Code of Honor Name', accessor: 'code_of_honor_name' as keyof CodeOfHonor },
    { 
      header: 'Explanation', 
      accessor: 'explanation' as keyof CodeOfHonor,
      cell: (item: CodeOfHonor) => (
        <div className="max-w-md truncate" title={item.explanation}>
          {item.explanation}
        </div>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof CodeOfHonor,
      cell: (item: CodeOfHonor) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: CodeOfHonor) => {
    toast({
      title: 'Edit Code of Honor',
      description: `Editing ${item.code_of_honor_name}`,
    });
  };

  const handleDelete = (item: CodeOfHonor) => {
    toast({
      title: 'Delete Code of Honor',
      description: `Are you sure you want to delete ${item.code_of_honor_name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: CodeOfHonor) => {
    toast({
      title: 'View Code of Honor',
      description: `Viewing details for ${item.code_of_honor_name}`,
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