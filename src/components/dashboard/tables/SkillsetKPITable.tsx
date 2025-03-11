import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface SkillsetKPI extends BaseItem {
  name: string;
  category: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  status: 'Active' | 'Inactive';
}

interface SkillsetKPITableProps {
  isLoading: boolean;
}

export function SkillsetKPITable({ isLoading }: SkillsetKPITableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<SkillsetKPI[]>([]);

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic':
        return 'outline';
      case 'Intermediate':
        return 'default';
      case 'Advanced':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof SkillsetKPI },
    { header: 'Category', accessor: 'category' as keyof SkillsetKPI },
    { 
      header: 'Difficulty', 
      accessor: 'difficulty' as keyof SkillsetKPI,
      cell: (item: SkillsetKPI) => (
        <Badge variant={getDifficultyVariant(item.difficulty)}>
          {item.difficulty}
        </Badge>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof SkillsetKPI,
      cell: (item: SkillsetKPI) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: SkillsetKPI) => {
    toast({
      title: 'Edit Skillset KPI',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: SkillsetKPI) => {
    toast({
      title: 'Delete Skillset KPI',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: SkillsetKPI) => {
    toast({
      title: 'View Skillset KPI',
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
      searchPlaceholder="Search skillset KPIs..."
    />
  );
} 