import React, { useState, useEffect, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Product } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const ProductsPage = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    loadingProducts,
    loadingCategories,
  } = useData();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    image: "",
    description: "",
    price: 0,
    category_id: "",
    stock: 0,
    low_stock_threshold: 5,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;

      // Price filter
      const matchesPrice =
        (priceRange.min === "" ||
          product.price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || product.price <= parseFloat(priceRange.max));

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          product.stock <= product.low_stock_threshold) ||
        (stockFilter === "normal" &&
          product.stock > product.low_stock_threshold &&
          product.stock > 0) ||
        (stockFilter === "out" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "stock":
          aValue = a.stock;
          bValue = b.stock;
          break;
        case "category":
          aValue = getCategoryName(a.category_id).toLowerCase();
          bValue = getCategoryName(b.category_id).toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
    priceRange,
    stockFilter,
    sortBy,
    sortOrder,
    categories,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setStockFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory !== "all") count++;
    if (priceRange.min || priceRange.max) count++;
    if (stockFilter !== "all") count++;
    return count;
  };

  // Helper function to safely format currency
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "0.00";
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Helper function to get stock status
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { text: "Agotado", color: "bg-red-500" };
    if (product.stock <= product.low_stock_threshold)
      return { text: "Stock Bajo", color: "bg-yellow-500" };
    return { text: "Disponible", color: "bg-green-500" };
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      image: "",
      description: "",
      price: 0,
      category_id: "",
      stock: 0,
      low_stock_threshold: 5,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      image: product.image || "",
      description: product.description || "",
      price: product.price,
      category_id: product.category_id,
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
      } else {
        await addProduct(productForm);
        await fetchProducts();
      }
      setIsAddEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-motoGray-dark">
          Gestión de Productos
        </h1>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-motoRed hover:bg-motoRed-dark text-motoWhite"
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Producto
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 bg-motoWhite border-motoGray">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-motoGray h-4 w-4" />
              <Input
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-motoGray focus:border-motoRed text-motoGray-dark"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:w-auto bg-motoWhite border-motoGray">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm text-motoGray">
              <div className="flex items-center gap-2">
                <span>Total:</span>
                <Badge
                  variant="secondary"
                  className="bg-motoGray-light text-motoGray-dark"
                >
                  {filteredProducts.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Stock bajo:</span>
                <Badge
                  variant="destructive"
                  className="bg-yellow-500 text-white"
                >
                  {
                    filteredProducts.filter(
                      (p) => p.stock <= p.low_stock_threshold && p.stock > 0
                    ).length
                  }
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Agotados:</span>
                <Badge variant="destructive" className="bg-red-500 text-white">
                  {filteredProducts.filter((p) => p.stock === 0).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-motoWhite border-motoGray">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-motoGray-dark flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filtros y Ordenamiento
            </CardTitle>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-motoGray hover:text-motoRed border-motoGray"
                >
                  <X className="mr-1 h-3 w-3" />
                  Limpiar ({getActiveFiltersCount()})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-motoGray hover:text-motoRed border-motoGray"
              >
                <Filter className="mr-1 h-3 w-3" />
                {showFilters ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Categoría
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="border-motoGray focus:border-motoRed text-motoGray-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Precio Mín.
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  className="border-motoGray focus:border-motoRed text-motoGray-dark"
                />
              </div>

              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Precio Máx.
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="999.99"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  className="border-motoGray focus:border-motoRed text-motoGray-dark"
                />
              </div>

              {/* Stock Filter */}
              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Estado Stock
                </Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="border-motoGray focus:border-motoRed text-motoGray-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Disponible</SelectItem>
                    <SelectItem value="low">Stock Bajo</SelectItem>
                    <SelectItem value="out">Agotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Ordenar por
                </Label>
                <div className="flex gap-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-motoGray focus:border-motoRed text-motoGray-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="price">Precio</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="category">Categoría</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="px-2 border-motoGray text-motoGray hover:text-motoRed"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Products Table */}
      <div className="rounded-md border bg-motoWhite border-motoGray">
        <Table>
          <TableHeader>
            <TableRow className="bg-motoGray-light">
              <TableHead className="w-[100px] text-motoGray-dark">
                Imagen
              </TableHead>
              <TableHead className="text-motoGray-dark">Nombre</TableHead>
              <TableHead className="text-motoGray-dark">Categoría</TableHead>
              <TableHead className="text-motoGray-dark">Precio</TableHead>
              <TableHead className="text-motoGray-dark">Stock</TableHead>
              <TableHead className="text-motoGray-dark">Estado</TableHead>
              <TableHead className="text-motoGray-dark">Alerta Stock</TableHead>
              <TableHead className="text-motoGray-dark text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingProducts ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-motoGray"
                >
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow
                    key={product.id}
                    className="hover:bg-motoWhite-dark"
                  >
                    <TableCell>
                      <img
                        src={product.image || "https://ferreteriavidri.com/images/items/large/159364.jpg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://ferreteriavidri.com/images/items/large/159364.jpg";
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-motoGray-dark">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-motoGray">
                      {getCategoryName(product.category_id)}
                    </TableCell>
                    <TableCell className="text-motoGray">
                      ${formatCurrency(product.price)}
                    </TableCell>
                    <TableCell
                      className={
                        product.stock <= product.low_stock_threshold
                          ? "text-motoRed font-semibold"
                          : "text-motoGray"
                      }
                    >
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${stockStatus.color} text-white`}>
                        {stockStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-motoGray">
                      {product.low_stock_threshold}
                    </TableCell>
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-motoGray"
                >
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  priceRange.min ||
                  priceRange.max ||
                  stockFilter !== "all"
                    ? "No se encontraron productos que coincidan con los filtros aplicados."
                    : "No hay productos registrados."}
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
            <DialogTitle className="text-motoGray-dark">
              {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
            </DialogTitle>
            <DialogDescription className="text-motoGray">
              {editingProduct
                ? "Realiza cambios en los detalles del producto."
                : "Ingresa los detalles del nuevo producto aquí."}
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
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
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
                onChange={(e) =>
                  setProductForm({ ...productForm, image: e.target.value })
                }
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                placeholder="https://ferreteriavidri.com/images/items/large/159364.jpg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-motoGray">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-motoGray">
                Categoría
              </Label>
              <Select
                value={productForm.category_id}
                onValueChange={(value) =>
                  setProductForm({
                    ...productForm,
                    category_id: value,
                  })
                }
                required
              >
                <SelectTrigger className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Cargando categorías...
                    </SelectItem>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No hay categorías disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right text-motoGray">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="lowStockThreshold"
                className="text-right text-motoGray"
              >
                Alerta Stock Bajo
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={productForm.low_stock_threshold}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    low_stock_threshold: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-motoRed hover:bg-motoRed-dark text-motoWhite"
              >
                {editingProduct ? "Guardar Cambios" : "Agregar Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-motoWhite border-motoGray">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-motoGray-dark">
              ¿Estás absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-motoGray">
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-motoGray text-motoGray hover:bg-motoGray-light">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-motoRed hover:bg-motoRed-dark text-motoWhite"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default ProductsPage;
