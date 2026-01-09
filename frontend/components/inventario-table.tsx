"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Edit, Trash2, Loader2, AlertTriangle, Package } from "lucide-react"
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

interface InventarioTableProps {
  onEdit: (producto: Product) => void
}

export function InventarioTable({ onEdit }: InventarioTableProps) {
  const [productos, setProductos] = useState<Product[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")
  const [stockFilter, setStockFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const { token } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener productos")
      }

      const data = await response.json()
      const products: Product[] = data.data || []
      setProductos(products)
      setFilteredProductos(products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProductos()
    }
  }, [token])

  useEffect(() => {
    let filtered = productos.filter(
      (producto) =>
        producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (categoriaFilter !== "todos") {
      filtered = filtered.filter((p) => p.category === categoriaFilter)
    }

    if (stockFilter === "bajo") {
      filtered = filtered.filter((p) => p.stock <= p.stock_min)
    } else if (stockFilter === "critico") {
      filtered = filtered.filter((p) => p.stock < p.stock_min * 0.5)
    }

    setFilteredProductos(filtered)
  }, [searchTerm, categoriaFilter, stockFilter, productos])

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar producto")
      }

      setProductos((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario",
      })
    } catch (error) {
      console.error("Error deleting producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock < stockMinimo * 0.5) {
      return { label: "Crítico", variant: "destructive" as const, icon: AlertTriangle }
    }
    if (stock <= stockMinimo) {
      return { label: "Bajo", variant: "secondary" as const, icon: Package }
    }
    return { label: "Normal", variant: "default" as const, icon: Package }
  }

  const totalProductos = productos.length
  const productosConStockBajo = productos.filter((p) => p.stock <= p.stock_min).length
  const productosConStockCritico = productos.filter((p) => p.stock < p.stock_min * 0.5).length

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map((p) => p.category).filter(Boolean))]

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">En inventario</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosConStockBajo}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosConStockCritico}</div>
            <p className="text-xs text-muted-foreground">Urgente reabastecer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Listado de Productos</CardTitle>
              <CardDescription>Administra y visualiza todo tu inventario</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o categoría..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat!}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los stocks</SelectItem>
                  <SelectItem value="bajo">Stock bajo</SelectItem>
                  <SelectItem value="critico">Stock crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || categoriaFilter !== "todos" || stockFilter !== "todos"
                  ? "No se encontraron productos con los filtros aplicados"
                  : "No hay productos en el inventario"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => {
                    const stockStatus = getStockStatus(producto.stock, producto.stock_min)
                    const StockIcon = stockStatus.icon
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-mono text-xs">{producto.id}</TableCell>
                        <TableCell className="font-medium">{producto.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{producto.category || "Sin categoría"}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {producto.description || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{producto.stock}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant} className="gap-1">
                            <StockIcon className="h-3 w-3" />
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>${producto.price.toLocaleString("es-AR")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(producto)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(producto.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
