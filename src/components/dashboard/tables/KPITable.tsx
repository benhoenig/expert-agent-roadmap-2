import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface KPI extends BaseItem {
  id: number;
  created_at: string;
  kpi_name: string;
  kpi_type: 'Action' | 'Skillset';
}

interface KPITableProps {
  isLoading: boolean;
}

export function KPITable({ isLoading }: KPITableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<KPI[]>([]);

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Action':
        return 'default';
      case 'Skillset':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns = [
    { header: 'KPI Name', accessor: 'kpi_name' as keyof KPI },
    { 
      header: 'Type', 
      accessor: 'kpi_type' as keyof KPI,
      cell: (item: KPI) => (
        <Badge variant={getTypeVariant(item.kpi_type)}>
          {item.kpi_type}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: 'created_at' as keyof KPI,
      cell: (item: KPI) => (
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      )
    },
  ];

  const handleEdit = (item: KPI) => {
    toast({
      title: 'Edit KPI',
      description: `Editing ${item.kpi_name}`,
    });
  };

  const handleDelete = (item: KPI) => {
    toast({
      title: 'Delete KPI',
      description: `Are you sure you want to delete ${item.kpi_name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: KPI) => {
    toast({
      title: 'View KPI',
      description: `Viewing details for ${item.kpi_name}`,
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
      searchPlaceholder="Search KPIs..."
    />
  );
} 