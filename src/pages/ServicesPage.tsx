import React, { useState, useMemo } from "react";
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
  Wrench,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Service } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const ServicesPage = () => {
  const {
    services,
    addService,
    updateService,
    deleteService,
    fetchServices,
    loadingServices,
  } = useData();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    let filtered = services.filter((service) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Price filter
      const matchesPrice =
        (priceRange.min === "" ||
          service.price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || service.price <= parseFloat(priceRange.max));

      return matchesSearch && matchesPrice;
    });

    // Sort services
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
        case "description":
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
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
  }, [services, searchTerm, priceRange, sortBy, sortOrder]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalServices = filteredServices.length;
    const totalValue = filteredServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    const averagePrice = totalServices > 0 ? totalValue / totalServices : 0;
    const minPrice =
      filteredServices.length > 0
        ? Math.min(...filteredServices.map((s) => s.price))
        : 0;
    const maxPrice =
      filteredServices.length > 0
        ? Math.max(...filteredServices.map((s) => s.price))
        : 0;

    return {
      totalServices,
      averagePrice,
      minPrice,
      maxPrice,
    };
  }, [filteredServices]);

  // Helper function to safely format currency
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "0.00";
    const num = Number(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  const handleOpenAddDialog = () => {
    setEditingService(null);
    setServiceForm({
      name: "",
      description: "",
      price: 0,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, { ...editingService, ...serviceForm });
    } else {
      addService(serviceForm);
      fetchServices();
    }
    setIsAddEditDialogOpen(false);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setServiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteService = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      setServiceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-motoGray-dark">
          Gestión de Servicios
        </h1>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-motoRed hover:bg-motoRed-dark text-motoWhite"
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 bg-motoWhite border-motoGray">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-motoGray h-4 w-4" />
              <Input
                placeholder="Buscar servicios por nombre o descripción..."
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
                  {filteredServices.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Promedio:</span>
                <Badge
                  variant="outline"
                  className="border-motoGray text-motoGray-dark"
                >
                  ${statistics.averagePrice.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Servicios
                </p>
                <p className="text-2xl font-bold">{statistics.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Precio Promedio
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.averagePrice.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Precio Mínimo
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.minPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Precio Máximo
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.maxPrice.toFixed(2)}
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <SelectItem value="description">Descripción</SelectItem>
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

              {/* Quick Price Filters */}
              <div>
                <Label className="text-sm text-motoGray mb-2 block">
                  Filtros Rápidos
                </Label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange({ min: "", max: "50" })}
                    className="text-xs px-2 py-1 h-auto border-motoGray text-motoGray hover:text-motoRed"
                  >
                    &lt; $50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange({ min: "50", max: "200" })}
                    className="text-xs px-2 py-1 h-auto border-motoGray text-motoGray hover:text-motoRed"
                  >
                    $50-200
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange({ min: "200", max: "" })}
                    className="text-xs px-2 py-1 h-auto border-motoGray text-motoGray hover:text-motoRed"
                  >
                    &gt; $200
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Services Table */}
      <Card className="bg-motoWhite border-motoGray">
        <CardHeader>
          <CardTitle className="text-xl text-motoGray-dark flex items-center justify-between">
            <span>Catálogo de Servicios ({filteredServices.length})</span>
            {filteredServices.length !== services.length && (
              <Badge variant="outline">
                {filteredServices.length} de {services.length} servicios
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-motoGray-light">
                  <TableHead className="text-motoGray-dark">Nombre</TableHead>
                  <TableHead className="text-motoGray-dark">
                    Descripción
                  </TableHead>
                  <TableHead className="text-motoGray-dark">Precio</TableHead>
                  <TableHead className="text-motoGray-dark text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingServices ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-motoGray"
                    >
                      Cargando servicios...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-motoWhite-dark"
                    >
                      <TableCell className="font-medium text-motoGray-dark">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-motoGray max-w-md">
                        <div className="truncate" title={service.description}>
                          {service.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-motoGray font-semibold">
                        ${formatCurrency(service.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(service)}
                          className="text-motoGray hover:text-motoRed"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(service.id)}
                          className="text-motoGray hover:text-motoRed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-motoGray"
                    >
                      {searchTerm || priceRange.min || priceRange.max
                        ? "No se encontraron servicios que coincidan con los filtros aplicados."
                        : "No hay servicios registrados."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-motoWhite border-motoGray">
          <DialogHeader>
            <DialogTitle className="text-motoGray-dark">
              {editingService ? "Editar Servicio" : "Agregar Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription className="text-motoGray">
              {editingService
                ? "Realiza cambios en los detalles del servicio."
                : "Ingresa los detalles del nuevo servicio aquí."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-motoGray">
                Nombre
              </Label>
              <Input
                id="name"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-motoGray">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
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
                value={serviceForm.price}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    price: parseFloat(e.target.value) || 0,
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
                {editingService ? "Guardar Cambios" : "Agregar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Service Alert Dialog */}
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
              el servicio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-motoGray text-motoGray hover:bg-motoGray-light">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
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

export default ServicesPage;
