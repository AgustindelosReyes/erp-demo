"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Loader2, DollarSign, ShoppingCart, TrendingUp, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Venta {
  id: number
  numeroVenta: string
  fecha: string
  cliente: string
  productos: number
  subtotal: number
  descuento: number
  total: number
  estado: "completada" | "pendiente" | "cancelada"
  metodoPago: string
  vendedor: string
}

interface VentasTableProps {
  onView: (venta: Venta) => void
}

export function VentasTable({ onView }: VentasTableProps) {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [periodoFilter, setPeriodoFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { token } = useAuth()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  const fetchVentas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (estadoFilter !== "todos") {
        params.append("status", estadoFilter)
      }
      if (periodoFilter !== "todos") {
        params.append("periodo", periodoFilter)
      }

      const response = await fetch(`${API_URL}/movements?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener ventas")
      }

      const data = await response.json()
      const ventasData: Venta[] = data.data || []
      setVentas(ventasData)
      setFilteredVentas(ventasData)
    } catch (error) {
      console.error("Error fetching ventas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchVentas()
    }
  }, [token, estadoFilter, periodoFilter])

  useEffect(() => {
    let filtered = ventas.filter(
      (venta) =>
        venta.numeroVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.vendedor.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredVentas(filtered)
  }, [searchTerm, ventas])

  const getEstadoBadge = (estado: Venta["estado"]) => {
    switch (estado) {
      case "completada":
        return <Badge variant="default">Completada</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
    }
  }

  const totalVentas = ventas.filter((v) => v.estado === "completada").length
  const montoTotal = ventas.filter((v) => v.estado === "completada").reduce((sum, v) => sum + v.total, 0)
  const ventasPendientes = ventas.filter((v) => v.estado === "pendiente").length
  const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">Ventas completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${montoTotal.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">En ventas completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${promedioVenta.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Por venta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasPendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Registro de Ventas</CardTitle>
              <CardDescription>Visualiza y administra todas las transacciones</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por N° venta, cliente o vendedor..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo el período</SelectItem>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Última semana</SelectItem>
                  <SelectItem value="mes">Último mes</SelectItem>
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
          ) : filteredVentas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || estadoFilter !== "todos" || periodoFilter !== "todos"
                  ? "No se encontraron ventas con los filtros aplicados"
                  : "No hay ventas registradas"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Venta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Método Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVentas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-mono text-xs font-semibold">{venta.numeroVenta}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {new Date(venta.fecha).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(venta.fecha).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{venta.cliente}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{venta.productos} items</Badge>
                      </TableCell>
                      <TableCell>${venta.subtotal.toLocaleString("es-AR")}</TableCell>
                      <TableCell>
                        {venta.descuento > 0 ? (
                          <span className="text-green-600">-${venta.descuento.toLocaleString("es-AR")}</span>
                        ) : (
                          <span className="text-muted-foreground">$0</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">${venta.total.toLocaleString("es-AR")}</TableCell>
                      <TableCell>{getEstadoBadge(venta.estado)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{venta.metodoPago}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onView(venta)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
