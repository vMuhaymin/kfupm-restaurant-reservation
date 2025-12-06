import { useState, useEffect } from "react";
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
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { menuAPI } from "@/lib/api";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
  imageUrl: string;
}

interface MenuManagementProps {
  menuItems: MenuItem[];
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onEditItem: (itemId: string, updates: Partial<MenuItem>) => void;
  onDeleteItem: (itemId: string) => void;
}

export function MenuManagement({ menuItems, onAddItem, onEditItem, onDeleteItem }: MenuManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    description: '',
    image: null as File | null,
    imagePreview: null as string | null,
  });

  const categories = ['Main Course', 'Appetizer', 'Dessert', 'Beverage', 'Side Dish'];

  // Reset form when add dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        name: '',
        price: '',
        category: 'Main Course',
        description: '',
        image: null,
        imagePreview: null,
      });
    }
  }, [isAddDialogOpen]);

  const handleAddItem = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    if (menuItems.some(item => item.name.toLowerCase() === formData.name.toLowerCase())) {
      toast.error('Item name must be unique');
      return;
    }

    if (!formData.image) {
      toast.error('Please select an image for the menu item');
      return;
    }

    try {
      // Upload image first
      toast.loading('Uploading image...');
      const uploadResult = await menuAPI.uploadImage(formData.image);
      const imagePath = uploadResult.imagePath;
      
      // Create menu item with the uploaded image path
      onAddItem({
        name: formData.name,
        price: price,
        category: formData.category,
        description: formData.description,
        available: true,
        imageUrl: `http://localhost:55555/uploads${imagePath}`,
      });

      setFormData({ name: '', price: '', category: 'Main Course', description: '', image: null, imagePreview: null });
      setIsAddDialogOpen(false);
      toast.dismiss();
      toast.success('Menu item added successfully');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    const updates: any = {
      name: formData.name,
      price: price,
      category: formData.category,
      description: formData.description,
    };

    // If a new image was selected, upload it first
    if (formData.image) {
      try {
        toast.loading('Uploading image...');
        const uploadResult = await menuAPI.uploadImage(formData.image);
        const imagePath = uploadResult.imagePath;
        updates.imageUrl = `http://localhost:55555/uploads${imagePath}`;
        toast.dismiss();
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.message || 'Failed to upload image');
        return;
      }
    }

    onEditItem(editingItem.id, updates);

    setEditingItem(null);
    setFormData({ name: '', price: '', category: 'Main Course', description: '', image: null, imagePreview: null });
    setIsEditDialogOpen(false);
    toast.success('Menu item updated successfully');
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || '',
      image: null,
      imagePreview: item.imageUrl,
    });
    setIsEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleDeleteClick = (itemId: string, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      toast.success('Menu item deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">Menu Management</CardTitle>
            <Dialog 
              open={isAddDialogOpen} 
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  // Reset form when dialog closes
                  setFormData({
                    name: '',
                    price: '',
                    category: 'Main Course',
                    description: '',
                    image: null,
                    imagePreview: null,
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>Add a new item to the menu</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (SAR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter item description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image *</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      {formData.imagePreview && (
                        <div className="mt-2">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Image</TableHead>
                  <TableHead className="text-xs sm:text-sm">Item</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-2 sm:p-4">
                      <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-semibold truncate">{item.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{item.category}</TableCell>
                    <TableCell className="text-xs sm:text-sm font-semibold">{item.price.toFixed(2)} SAR</TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex gap-1 flex-col sm:flex-row">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                          className="h-8 text-xs"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(item.id, item.name)}
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
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (SAR) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image {formData.imagePreview && '(Current)'}</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {formData.imagePreview && (
                  <div className="mt-2">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.image ? 'New image selected' : 'Current image'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleEditItem} className="w-full bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{itemToDelete?.name}"</strong> from the menu? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
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