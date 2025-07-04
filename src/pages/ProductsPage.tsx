import React, { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/context/DataContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    image: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    lowStockThreshold: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      image: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      lowStockThreshold: 0,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      image: product.image,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productForm });
    } else {
      addProduct(productForm);
    }
    setIsAddEditDialogOpen(false);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-motoGray-dark">Gestión de Productos</h1>
        <Button onClick={handleOpenAddDialog} className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
          <Plus className="mr-2 h-4 w-4" /> Agregar Producto
        </Button>
      </div>
      <p className="text-lg text-motoGray">Aquí podrás ver, agregar, editar y eliminar productos.</p>

      <div className="rounded-md border bg-motoWhite border-motoGray">
        <Table>
          <TableHeader>
            <TableRow className="bg-motoGray-light">
              <TableHead className="w-[100px] text-motoGray-dark">Imagen</TableHead>
              <TableHead className="text-motoGray-dark">Nombre</TableHead>
              <TableHead className="text-motoGray-dark">Categoría</TableHead>
              <TableHead className="text-motoGray-dark">Precio</TableHead>
              <TableHead className="text-motoGray-dark">Stock</TableHead>
              <TableHead className="text-motoGray-dark">Alerta Stock</TableHead>
              <TableHead className="text-motoGray-dark text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-motoWhite-dark">
                  <TableCell>
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                  </TableCell>
                  <TableCell className="font-medium text-motoGray-dark">{product.name}</TableCell>
                  <TableCell className="text-motoGray">{product.category}</TableCell>
                  <TableCell className="text-motoGray">${product.price.toFixed(2)}</TableCell>
                  <TableCell className={product.stock <= product.lowStockThreshold ? "text-motoRed font-semibold" : "text-motoGray"}>
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-motoGray">{product.lowStockThreshold}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(product)}
                      className="text-motoGray hover:text-motoRed"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(product.id)}
                      className="text-motoGray hover:text-motoRed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-motoGray">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-motoWhite border-motoGray">
          <DialogHeader>
            <DialogTitle className="text-motoGray-dark">{editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
            <DialogDescription className="text-motoGray">
              {editingProduct ? "Realiza cambios en los detalles del producto." : "Ingresa los detalles del nuevo producto aquí."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-motoGray">
                Nombre
              </Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right text-motoGray">
                URL Imagen
              </Label>
              <Input
                id="image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                placeholder="https://via.placeholder.com/150"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-motoGray">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-motoGray">
                Precio
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-motoGray">
                Categoría
              </Label>
              <Input
                id="category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right text-motoGray">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lowStockThreshold" className="text-right text-motoGray">
                Alerta Stock Bajo
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={productForm.lowStockThreshold}
                onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
                {editingProduct ? "Guardar Cambios" : "Agregar Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-motoWhite border-motoGray">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-motoGray-dark">¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-motoGray">
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-motoGray text-motoGray hover:bg-motoGray-light">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MadeWithDyad />
    </div>
  );
};

export default ProductsPage;