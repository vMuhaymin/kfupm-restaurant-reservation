import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  role: 'staff' | 'manager';
  createdAt: string;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'> & { password: string }) => void;
  onEditUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagement({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' as 'staff' | 'manager',
  });

  const handleAddUser = () => {
    if (!formData.username || !formData.password) {
      toast.error('Username and password must be valid');
      return;
    }

    if (users.some(user => user.username.toLowerCase() === formData.username.toLowerCase())) {
      toast.error('No duplicate accounts allowed');
      return;
    }

    onAddUser({
      username: formData.username,
      password: formData.password,
      role: formData.role,
    });

    setFormData({ username: '', password: '', role: 'staff' });
    setIsAddDialogOpen(false);
    toast.success('User account updated successfully');
  };

  const handleEditUser = () => {
    if (!editingUser || !formData.username) {
      toast.error('Username must be valid');
      return;
    }

    const updates: any = {
      username: formData.username,
      role: formData.role,
    };
    
    if (formData.password) {
      updates.password = formData.password;
    }
    
    onEditUser(editingUser.id, updates);

    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'staff' });
    setIsEditDialogOpen(false);
    toast.success('User account updated successfully');
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (userId: string, username: string) => {
    setUserToDelete({ id: userId, username });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new staff or manager account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value: 'staff' | 'manager') => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddUser} className="w-full bg-blue-600 hover:bg-blue-700">
                    Add User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm sm:text-base">No users found. Click "Add User" to create a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Username</TableHead>
                    <TableHead className="text-xs sm:text-sm">Role</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs sm:text-sm font-semibold truncate">{user.username}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge 
                        variant="outline"
                        className={`${user.role === 'manager' 
                          ? 'bg-blue-100 text-blue-800 border-blue-300' 
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                        } text-xs`}
                      >
                        {user.role === 'manager' ? 'Manager' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex gap-1 flex-col sm:flex-row">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                          className="h-8 text-xs"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(user.id, user.username)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: 'staff' | 'manager') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <Button onClick={handleEditUser} className="w-full bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>"{userToDelete?.username}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}