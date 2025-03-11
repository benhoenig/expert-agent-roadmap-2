import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface ActionKPI extends BaseItem {
  name: string;
  category: string;
  points: number;
  status: 'Active' | 'Inactive';
}

interface ActionKPITableProps {
  isLoading: boolean;
}

export function ActionKPITable({ isLoading }: ActionKPITableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<ActionKPI[]>([]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof ActionKPI },
    { header: 'Category', accessor: 'category' as keyof ActionKPI },
    { header: 'Points', accessor: 'points' as keyof ActionKPI },
    { 
      header: 'Status', 
      accessor: 'status' as keyof ActionKPI,
      cell: (item: ActionKPI) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: ActionKPI) => {
    toast({
      title: 'Edit Action KPI',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: ActionKPI) => {
    toast({
      title: 'Delete Action KPI',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: ActionKPI) => {
    toast({
      title: 'View Action KPI',
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
      searchPlaceholder="Search action KPIs..."
    />
  );
} 