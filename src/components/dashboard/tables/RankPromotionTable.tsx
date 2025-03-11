import { useState } from 'react';
import { BaseTable, BaseItem } from './BaseTable';
import { Badge } from '../../ui/badge';
import { useToast } from '../../ui/use-toast';

interface RankPromotion extends BaseItem {
  name: string;
  fromRank: string;
  toRank: string;
  requirements: string;
  status: 'Active' | 'Inactive';
}

interface RankPromotionTableProps {
  isLoading: boolean;
}

export function RankPromotionTable({ isLoading }: RankPromotionTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<RankPromotion[]>([]);

  const columns = [
    { header: 'Name', accessor: 'name' as keyof RankPromotion },
    { header: 'From Rank', accessor: 'fromRank' as keyof RankPromotion },
    { header: 'To Rank', accessor: 'toRank' as keyof RankPromotion },
    { 
      header: 'Requirements', 
      accessor: 'requirements' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <div className="max-w-md truncate" title={item.requirements}>
          {item.requirements}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof RankPromotion,
      cell: (item: RankPromotion) => (
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const handleEdit = (item: RankPromotion) => {
    toast({
      title: 'Edit Rank Promotion',
      description: `Editing ${item.name}`,
    });
  };

  const handleDelete = (item: RankPromotion) => {
    toast({
      title: 'Delete Rank Promotion',
      description: `Are you sure you want to delete ${item.name}?`,
      variant: 'destructive',
    });
  };

  const handleView = (item: RankPromotion) => {
    toast({
      title: 'View Rank Promotion',
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
      searchPlaceholder="Search rank promotions..."
    />
  );
} 