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
import { Service } from "@/types";
import { Textarea } from "@/components/ui/textarea";

const ServicesPage = () => {
  const { services, addService, updateService, deleteService } = useData();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

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
      updateService({ ...editingService, ...serviceForm });
    } else {
      addService(serviceForm);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-motoGray-dark">Gestión de Servicios</h1>
        <Button onClick={handleOpenAddDialog} className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
          <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
        </Button>
      </div>
      <p className="text-lg text-motoGray">Aquí podrás ver, agregar, editar y eliminar servicios.</p>

      <div className="rounded-md border bg-motoWhite border-motoGray">
        <Table>
          <TableHeader>
            <TableRow className="bg-motoGray-light">
              <TableHead className="text-motoGray-dark">Nombre</TableHead>
              <TableHead className="text-motoGray-dark">Descripción</TableHead>
              <TableHead className="text-motoGray-dark">Precio</TableHead>
              <TableHead className="text-motoGray-dark text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id} className="hover:bg-motoWhite-dark">
                  <TableCell className="font-medium text-motoGray-dark">{service.name}</TableCell>
                  <TableCell className="text-motoGray">{service.description}</TableCell>
                  <TableCell className="text-motoGray">${service.price.toFixed(2)}</TableCell>
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
                <TableCell colSpan={4} className="h-24 text-center text-motoGray">
                  No hay servicios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Service Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-motoWhite border-motoGray">
          <DialogHeader>
            <DialogTitle className="text-motoGray-dark">{editingService ? "Editar Servicio" : "Agregar Nuevo Servicio"}</DialogTitle>
            <DialogDescription className="text-motoGray">
              {editingService ? "Realiza cambios en los detalles del servicio." : "Ingresa los detalles del nuevo servicio aquí."}
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
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
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
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
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
                onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                className="col-span-3 border-motoGray focus:border-motoRed text-motoGray-dark"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
                {editingService ? "Guardar Cambios" : "Agregar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Service Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-motoWhite border-motoGray">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-motoGray-dark">¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-motoGray">
              Esta acción no se puede deshacer. Esto eliminará permanentemente el servicio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-motoGray text-motoGray hover:bg-motoGray-light">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-motoRed hover:bg-motoRed-dark text-motoWhite">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MadeWithDyad />
    </div>
  );
};

export default ServicesPage;