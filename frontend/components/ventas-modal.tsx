"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, User, Calendar, CreditCard, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VentaModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  venta?: any
}

interface ProductoVenta {
  id: string
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export function VentaModal({ isOpen, onClose, venta }: VentaModalProps) {
  const [loading, setLoading] = useState(false)
  const [cliente, setCliente] = useState("")
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [descuento, setDescuento] = useState(0)
  const [productos, setProductos] = useState<ProductoVenta[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const { toast } = useToast()

  const isViewMode = !!venta

  useEffect(() => {
    if (venta) {
      // Viewing existing venta
      setCliente(venta.cliente)
      setMetodoPago(venta.metodoPago.toLowerCase())
      setDescuento(venta.descuento)
      // Mock productos for demonstration
      setProductos([
        {
          id: "1",
          nombre: "Pintura Látex Blanco",
          cantidad: 2,
          precioUnitario: 12500,
          subtotal: 25000,
        },
        {
          id: "2",
          nombre: "Rodillo Premium",
          cantidad: 3,
          precioUnitario: 3500,
          subtotal: 10500,
        },
      ])
    } else {
      // Creating new venta
      setCliente("")
      setMetodoPago("efectivo")
      setDescuento(0)
      setProductos([])
    }
  }, [venta, isOpen])

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      toast({
        title: "Error",
        description: "Selecciona un producto y cantidad válida",
        variant: "destructive",
      })
      return
    }

    // Mock product data
    const mockPrecio = 12500
    const nuevoProducto: ProductoVenta = {
      id: Date.now().toString(),
      nombre: productoSeleccionado,
      cantidad,
      precioUnitario: mockPrecio,
      subtotal: mockPrecio * cantidad,
    }

    setProductos([...productos, nuevoProducto])
    setProductoSeleccionado("")
    setCantidad(1)
  }

  const eliminarProducto = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id))
  }

  const subtotal = productos.reduce((sum, p) => sum + p.subtotal, 0)
  const total = subtotal - descuento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cliente || productos.length === 0) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Example: await fetch('/api/ventas', { method: 'POST', body: JSON.stringify({...}) })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Venta registrada",
        description: "La venta ha sido registrada exitosamente",
      })
      onClose(true)
    } catch (error) {
      console.error("Error creating venta:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isViewMode ? "Detalles de Venta" : "Nueva Venta"}</DialogTitle>
          <DialogDescription>
            {isViewMode ? "Visualiza los detalles de la venta" : "Completa los datos para registrar una nueva venta"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente y Metadata */}
          <div className="grid gap-4">
            {isViewMode && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">N° de Venta</span>
                  </div>
                  <p className="font-mono font-semibold">{venta.numeroVenta}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Fecha</span>
                  </div>
                  <p className="font-medium">
                    {new Date(venta.fecha).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </div>
                </Label>
                {isViewMode ? (
                  <p className="text-lg font-medium">{cliente}</p>
                ) : (
                  <Input
                    id="cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Nombre del cliente"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPago">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Método de Pago
                  </div>
                </Label>
                {isViewMode ? (
                  <Badge className="text-sm">{venta.metodoPago}</Badge>
                ) : (
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger id="metodoPago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Productos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Productos</h3>

            {!isViewMode && (
              <div className="grid gap-4 md:grid-cols-[1fr,auto,auto]">
                <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pintura Látex Blanco">Pintura Látex Blanco - $12,500</SelectItem>
                    <SelectItem value="Esmalte Sintético">Esmalte Sintético - $18,500</SelectItem>
                    <SelectItem value="Rodillo Premium">Rodillo Premium - $3,500</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-24"
                  placeholder="Cant."
                />

                <Button type="button" onClick={agregarProducto} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            )}

            {productos.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 font-semibold text-sm grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4">
                  <div>Producto</div>
                  <div className="text-center">Cantidad</div>
                  <div className="text-right">P. Unitario</div>
                  <div className="text-right">Subtotal</div>
                  {!isViewMode && <div></div>}
                </div>
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="px-4 py-3 grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center border-t"
                  >
                    <div className="font-medium">{producto.nombre}</div>
                    <div className="text-center">{producto.cantidad}</div>
                    <div className="text-right">${producto.precioUnitario.toLocaleString("es-AR")}</div>
                    <div className="text-right font-semibold">${producto.subtotal.toLocaleString("es-AR")}</div>
                    {!isViewMode && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => eliminarProducto(producto.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay productos agregados</p>
            )}
          </div>

          <Separator />

          {/* Totales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${subtotal.toLocaleString("es-AR")}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="descuento" className="text-muted-foreground">
                Descuento
              </Label>
              {isViewMode ? (
                <span className="font-semibold text-green-600">${descuento.toLocaleString("es-AR")}</span>
              ) : (
                <Input
                  id="descuento"
                  type="number"
                  min="0"
                  max={subtotal}
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  className="w-32 text-right"
                />
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between text-xl">
              <span className="font-bold">Total</span>
              <span className="font-bold">${total.toLocaleString("es-AR")}</span>
            </div>
          </div>

          {/* Actions */}
          {!isViewMode && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Venta"
                )}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cerrar
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
