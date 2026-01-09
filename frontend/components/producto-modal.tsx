"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Product {
  id: number
  name: string
  description: string | null
  category: string | null
  stock: number
  stock_min: number
  price: number
}

interface ProductoModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  producto?: Product | null
}

export function ProductoModal({ isOpen, onClose, producto }: ProductoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    stock: "",
    stock_min: "",
    price: "",
  })
  const { toast } = useToast()
  const { token } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    if (producto) {
      setFormData({
        name: producto.name || "",
        description: producto.description || "",
        category: producto.category || "",
        stock: producto.stock?.toString() || "",
        stock_min: producto.stock_min?.toString() || "",
        price: producto.price?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        stock: "",
        stock_min: "",
        price: "",
      })
    }
  }, [producto, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.category) {
        toast({
          title: "Error de validación",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        stock_min: parseInt(formData.stock_min) || 0,
        price: parseFloat(formData.price) || 0,
      }

      let response
      if (producto) {
        // Actualizar producto existente
        response = await fetch(`${API_URL}/products/${producto.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        })
      } else {
        // Crear nuevo producto
        response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al guardar producto")
      }

      toast({
        title: producto ? "Producto actualizado" : "Producto creado",
        description: `${formData.name} ha sido ${producto ? "actualizado" : "agregado"} correctamente`,
      })

      onClose(true)
    } catch (error: any) {
      console.error("Error saving producto:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {producto ? "Modifica la información del producto" : "Agrega un nuevo producto al inventario"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Látex">Látex</SelectItem>
                    <SelectItem value="Esmalte">Esmalte</SelectItem>
                    <SelectItem value="Acrílico">Acrílico</SelectItem>
                    <SelectItem value="Herramientas">Herramientas</SelectItem>
                    <SelectItem value="Accesorios">Accesorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nombre del Producto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pintura Látex Interior Blanco"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Actual</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="45"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock_min">Stock Mínimo</Label>
                <Input
                  id="stock_min"
                  type="number"
                  value={formData.stock_min}
                  onChange={(e) => setFormData({ ...formData, stock_min: e.target.value })}
                  placeholder="20"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="12500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : producto ? (
                "Actualizar"
              ) : (
                "Crear Producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
