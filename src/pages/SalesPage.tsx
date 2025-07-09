import React, { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Product, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Trash2, ShoppingCart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface for cart items (different from SaleItem to handle UI state)
interface CartItem {
  id: string;
  type: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  discount: number; // Percentage discount
  stock?: number; // Only for products
}

const SalesPage = () => {
  const { products, services, addSale, loadingProducts, loadingServices } =
    useData();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Efectivo");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isProcessingSale, setIsProcessingSale] = useState<boolean>(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TAX_RATE = 0.16; // 16% tax rate

  const calculateTotals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;

    cartItems.forEach((item) => {
      const itemPrice = item.price * item.quantity;
      const itemDiscount = (itemPrice * item.discount) / 100;
      subtotal += itemPrice;
      discountTotal += itemDiscount;
    });

    const taxableAmount = subtotal - discountTotal;
    const taxAmount = taxableAmount * TAX_RATE;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountTotal, taxAmount, total };
  }, [cartItems]);

  const handleAddToCart = (
    item: Product | Service,
    type: "product" | "service"
  ) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.type === type
    );

    // Check stock for products
    if (type === "product") {
      const product = item as Product;
      if (product.stock <= 0) {
        toast.error(`"${product.name}" está agotado.`);
        return;
      }
      if (existingItemIndex > -1) {
        const currentQuantity = cartItems[existingItemIndex].quantity;
        if (currentQuantity >= product.stock) {
          toast.error(
            `No hay suficiente stock para "${product.name}". Stock actual: ${product.stock}`
          );
          return;
        }
      }
    }

    if (existingItemIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      const newItem: CartItem = {
        id: item.id,
        type,
        name: item.name,
        price: item.price,
        quantity: 1,
        discount: 0,
        ...(type === "product" && { stock: (item as Product).stock }),
      };
      setCartItems((prev) => [...prev, newItem]);
    }
    toast.success(`"${item.name}" añadido al carrito.`);
  };

  const handleUpdateQuantity = (
    id: string,
    type: "product" | "service",
    delta: number
  ) => {
    setCartItems((prev) => {
      const updatedCart = prev
        .map((item) => {
          if (item.id === id && item.type === type) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) {
              return null; // Mark for removal
            }
            if (
              item.type === "product" &&
              item.stock &&
              newQuantity > item.stock
            ) {
              toast.error(
                `No hay suficiente stock para "${item.name}". Stock actual: ${item.stock}`
              );
              return item; // Don't update quantity
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]; // Remove nulls

      return updatedCart;
    });
  };

  const handleUpdateDiscount = (
    id: string,
    type: "product" | "service",
    discount: number
  ) => {
    if (discount < 0 || discount > 100) {
      toast.error("El descuento debe estar entre 0% y 100%");
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === type ? { ...item, discount } : item
      )
    );
  };

  const handleRemoveItem = (id: string, type: "product" | "service") => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.type === type))
    );
    toast.info("Artículo eliminado del carrito.");
  };

  const handleFinalizeSale = async () => {
    if (cartItems.length === 0) {
      toast.error(
        "El carrito está vacío. Agrega productos o servicios para realizar una venta."
      );
      return;
    }
    if (!user) {
      toast.error("No hay un usuario autenticado para registrar la venta.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Selecciona un método de pago.");
      return;
    }

    // Final stock validation
    for (const cartItem of cartItems) {
      if (cartItem.type === "product") {
        const product = products.find((p) => p.id === cartItem.id);
        if (!product) {
          toast.error(`Producto "${cartItem.name}" no encontrado.`);
          return;
        }
        if (product.stock < cartItem.quantity) {
          toast.error(
            `Stock insuficiente para "${cartItem.name}". Disponible: ${product.stock}, Requerido: ${cartItem.quantity}`
          );
          return;
        }
      }
    }

    setIsProcessingSale(true);

    try {
      const { subtotal, discountTotal, taxAmount, total } = calculateTotals;

      // Convert cart items to sale items format
      const saleItems = cartItems.map((item) => ({
        item_id: item.id,
        item_type: item.type,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: (item.price * item.quantity * item.discount) / 100, // Convert percentage to amount
      }));

      const saleData = {
        subtotal,
        tax_rate: TAX_RATE,
        tax_amount: taxAmount,
        discount_total: discountTotal,
        total,
        payment_method: paymentMethod,
        cashier_id: user.id,
        items: saleItems,
      };

      console.log("🛒 [SalesPage] Prepared sale data:", saleData);
      console.log("🛒 [SalesPage] Cart items:", cartItems);
      console.log("🛒 [SalesPage] User:", user);

      await addSale(saleData);

      // Clear cart after successful sale
      setCartItems([]);
      setPaymentMethod("Efectivo");
      setSearchTerm("");

      toast.success("Venta registrada exitosamente!");
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error("Error al procesar la venta. Inténtalo de nuevo.");
    } finally {
      setIsProcessingSale(false);
    }
  };

  if (loadingProducts || loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-motoGray-dark">Nueva Venta</h1>
      <p className="text-lg text-motoGray">
        Registra nuevas ventas de productos y servicios.
      </p>

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-motoWhite border-motoGray hover:border-motoRed transition-colors cursor-pointer"
                    onClick={() => handleAddToCart(product, "product")}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md border border-motoGray"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-motoGray-dark text-sm mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-motoGray mb-2">
                            Stock: {product.stock}
                          </p>
                          <p className="text-lg font-bold text-motoRed">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-motoGray py-8">
                  No se encontraron productos
                </p>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="bg-motoWhite border-motoGray hover:border-motoRed transition-colors cursor-pointer"
                    onClick={() => handleAddToCart(service, "service")}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Service Icon */}
                        <div className="w-20 h-20 flex-shrink-0 bg-motoGray/10 rounded-md flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-motoRed"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>

                        {/* Service Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-motoGray-dark text-sm mb-1">
                            {service.name}
                          </h3>
                          <p className="text-xs text-motoGray mb-2 line-clamp-2">
                            {service.description}
                          </p>
                          <p className="text-lg font-bold text-motoRed">
                            ${service.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredServices.length === 0 && (
                <p className="text-center text-motoGray py-8">
                  No se encontraron servicios
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sales Cart */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-motoWhite border-motoGray">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-motoGray-dark">
                <ShoppingCart className="h-5 w-5" />
                Carrito de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-motoGray text-center py-4">
                  El carrito está vacío
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="border border-motoGray rounded p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-motoGray-dark text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-motoGray">
                            ${item.price.toFixed(2)} c/u
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id, item.type)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.type, -1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.type, 1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`discount-${item.id}`}
                          className="text-xs"
                        >
                          Desc %:
                        </Label>
                        <Input
                          id={`discount-${item.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) =>
                            handleUpdateDiscount(
                              item.id,
                              item.type,
                              Math.max(0, Math.min(100, Number(e.target.value)))
                            )
                          }
                          className="h-6 text-xs w-16"
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-motoGray-dark">
                          $
                          {(
                            item.price *
                            item.quantity *
                            (1 - item.discount / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="border-t border-motoGray pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${calculateTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Descuentos:</span>
                    <span>-${calculateTotals.discountTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>${calculateTotals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-motoGray pt-2">
                    <span>Total:</span>
                    <span>${calculateTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="payment-method"
                    className="text-sm font-medium"
                  >
                    Método de Pago
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="Transferencia">
                        Transferencia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleFinalizeSale}
                  disabled={cartItems.length === 0 || isProcessingSale}
                  className="w-full bg-motoRed hover:bg-motoRed/90 text-white"
                >
                  {isProcessingSale ? (
                    "Procesando..."
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Finalizar Venta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
