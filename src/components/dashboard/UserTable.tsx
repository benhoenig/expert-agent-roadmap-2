import { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2 
} from "lucide-react";
import { Badge } from "../ui/badge";
import { UserWithProfiles } from '../../services/userService';

interface UserTableProps {
  users: UserWithProfiles[];
  onEdit: (user: UserWithProfiles) => void;
  onDelete: (user: UserWithProfiles) => void;
  onView: (user: UserWithProfiles) => void;
  onCreateUser: () => void;
  isLoading: boolean;
}

export function UserTable({ 
  users, 
  onEdit, 
  onDelete, 
  onView, 
  onCreateUser, 
  isLoading 
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Log props when component receives them
  useEffect(() => {
    console.log('UserTable received props - users:', users);
    console.log('UserTable received props - isLoading:', isLoading);
  }, [users, isLoading]);
  
  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    console.log('Filtering users:', users);
    
    if (!users || users.length === 0) {
      console.log('No users to filter');
      return [];
    }
    
    return users.filter(user => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply role filter
      const matchesRole = roleFilter === '' || roleFilter === 'all' || user.role === roleFilter;
      
      // Apply status filter
      const matchesStatus = statusFilter === '' || statusFilter === 'all' || user.user_status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  // Get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Mentor':
        return 'secondary';
      case 'Sales':
        return 'outline';
      default:
        return 'default';
    }
  };
  
  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Terminate':
        return 'destructive';
      case 'Quit':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Mentor">Mentor</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Terminate">Terminate</SelectItem>
              <SelectItem value="Quit">Quit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              (() => {
                console.log('No users found - filteredUsers:', filteredUsers);
                console.log('Original users array:', users);
                return (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                );
              })()
            ) : (
              filteredUsers.map((user) => {
                console.log('Rendering user:', user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        {user.full_name}
                        {user.nickname && (
                          <span className="text-muted-foreground ml-1">({user.nickname})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.user_status) as any}>
                        {user.user_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 