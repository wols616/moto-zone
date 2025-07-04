import React, { useState, useMemo } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Product, Service, SaleItem, Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Minus, Trash2, ShoppingCart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SalesPage = () => {
  const { products, services, addSale } = useData();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tarjeta"); // Default to Card
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TAX_RATE = 0.16; // 16% tax rate

  const calculateTotals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;

    cartItems.forEach(item => {
      const itemPrice = item.price * item.quantity;
      const itemDiscount = item.discount ? (itemPrice * item.discount) / 100 : 0;
      subtotal += itemPrice;
      discountTotal += itemDiscount;
    });

    const taxableAmount = subtotal - discountTotal;
    const taxAmount = taxableAmount * TAX_RATE;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountTotal, taxAmount, total };
  }, [cartItems]);

  const handleAddToCart = (item: Product | Service, type: "product" | "service") => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id && cartItem.type === type);

    if (type === "product") {
      const product = item as Product;
      if (product.stock <= 0) {
        toast.error(`"${product.name}" está agotado.`);
        return;
      }
      if (existingItemIndex > -1) {
        const currentQuantity = cartItems[existingItemIndex].quantity;
        if (currentQuantity >= product.stock) {
          toast.error(`No hay suficiente stock para "${product.name}". Stock actual: ${product.stock}`);
          return;
        }
      }
    }

    if (existingItemIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      setCartItems(prev => [...prev, {
        id: item.id,
        type,
        name: item.name,
        price: item.price,
        quantity: 1,
        // Assuming discount is only applied at sale time, not inherent to product/service
        // If products/services had a default discount, it would be added here.
        // For now, mockData has a discount on a sale item, not the product itself.
      }]);
    }
    toast.success(`"${item.name}" añadido al carrito.`);
  };

  const handleUpdateQuantity = (id: string, type: "product" | "service", delta: number) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item => {
        if (item.id === id && item.type === type) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) {
            return null; // Mark for removal
          }
          if (item.type === "product") {
            const product = products.find(p => p.id === id);
            if (product && newQuantity > product.stock) {
              toast.error(`No hay suficiente stock para "${item.name}". Stock actual: ${product.stock}`);
              return item; // Do not update if stock is insufficient
            }
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as SaleItem[]; // Remove nulls

      return updatedCart;
    });
  };

  const handleRemoveItem = (id: string, type: "product" | "service") => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
    toast.info("Artículo eliminado del carrito.");
  };

  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío. Agrega productos o servicios para realizar una venta.");
      return;
    }
    if (!user) {
      toast.error("No hay un usuario autenticado para registrar la venta.");
      return;
    }

    const { subtotal, discountTotal, taxAmount, total } = calculateTotals;

    const newSale: Omit<Sale, "id"> = {
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      taxRate: TAX_RATE,
      taxAmount,
      discountTotal,
      total,
      paymentMethod,
      cashierId: user.id,
    };

    addSale(newSale);
    setCartItems([]); // Clear cart after sale
    setPaymentMethod("Tarjeta"); // Reset payment method
    setSearchTerm(""); // Clear search term
    toast.success("Venta registrada exitosamente!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Nueva Venta</h1>
      <p className="text-lg text-motoGray">Registra nuevas ventas de productos y servicios.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product/Service Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            placeholder="Buscar productos o servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-motoGray focus:border-motoRed text-motoGray-dark"
          />

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-motoGray-light">
              <TabsTrigger value="products" className="data-[state=active]:bg-motoRed data-[state=active]:text-motoWhite">Productos</TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-motoRed data-[state=active]:text-motoWhite">Servicios</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <Card key={product.id} className="bg-motoWhite border-motoGray flex flex-col">
                      <CardHeader className="p-0">
                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-t-md" />
                      </CardHeader>
                      <CardContent className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-motoGray-dark">{product.name}</CardTitle>
                          <p className="text-sm text-motoGray line-clamp-2">{product.description}</p>
                          <p className="text-md font-bold text-motoRed mt-2">${product.price.toFixed(2)}</p>
                          <p className={`text-sm ${product.stock <= product.lowStockThreshold ? 'text-motoRed' : 'text-motoGray'}`}>
                            Stock: {product.stock}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product, "product")}
                          className="mt-4 w-full bg-motoRed hover:bg-motoRed-dark text-motoWhite"
                          disabled={product.stock <= 0}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Añadir
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center text-motoGray">No se encontraron productos.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="services" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <Card key={service.id} className="bg-motoWhite border-motoGray flex flex-col">
                      <CardContent className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold text-motoGray-dark">{service.name}</CardTitle>
                          <p className="text-sm text-motoGray line-clamp-2">{service.description}</p>
                          <p className="text-md font-bold text-motoRed mt-2">${service.price.toFixed(2)}</p>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(service, "service")}
                          className="mt-4 w-full bg-motoRed hover:bg-motoRed-dark text-motoWhite"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Añadir
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center text-motoGray">No se encontraron servicios.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sales Cart */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader>
              <CardTitle className="text-xl text-motoGray-dark flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-motoRed" /> Carrito de Venta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-center text-motoGray">El carrito está vacío.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-motoGray-light">
                      <TableHead className="text-motoGray-dark">Artículo</TableHead>
                      <TableHead className="text-motoGray-dark text-center">Cant.</TableHead>
                      <TableHead className="text-motoGray-dark text-right">Subtotal</TableHead>
                      <TableHead className="text-motoGray-dark text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map(item => (
                      <TableRow key={`${item.id}-${item.type}`} className="hover:bg-motoWhite-dark">
                        <TableCell className="font-medium text-motoGray-dark">
                          {item.name}
                          {item.discount && <span className="text-xs text-motoRed ml-1">({item.discount}% desc.)</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.type, -1)}
                              className="h-6 w-6 text-motoGray hover:text-motoRed"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-motoGray">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.type, 1)}
                              className="h-6 w-6 text-motoGray hover:text-motoRed"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-motoGray">
                          ${((item.price * item.quantity) * (1 - (item.discount || 0) / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id, item.type)}
                            className="h-6 w-6 text-motoGray hover:text-motoRed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="mt-4 space-y-2 text-motoGray">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${calculateTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento Total:</span>
                  <span className="font-semibold text-motoRed">-${calculateTotals.discountTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuesto ({ (TAX_RATE * 100).toFixed(0) }%):</span>
                  <span className="font-semibold">${calculateTotals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-motoGray-dark border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${calculateTotals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="paymentMethod" className="text-motoGray">Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="w-full border-motoGray focus:border-motoRed text-motoGray-dark">
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent className="bg-motoWhite border-motoGray">
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleFinalizeSale}
                  className="w-full bg-motoRed hover:bg-motoRed-dark text-motoWhite"
                  disabled={cartItems.length === 0}
                >
                  <DollarSign className="mr-2 h-4 w-4" /> Finalizar Venta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SalesPage;