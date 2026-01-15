"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Building2, Users, Receipt, Bell, Globe, Shield, Database, Plug, Save, Upload, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/lib/auth-context'

export default function AjustesPage() {
   const { user, isLoading: authLoading } = useAuth()
   const router = useRouter()
   const { toast } = useToast()
   const [isLoading, setIsLoading] = useState(false)
   const [loadingData, setLoadingData] = useState(true)

   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

   useEffect(() => {
     if (!authLoading && !user) {
       router.push('/login')
     }
   }, [user, authLoading, router])

   useEffect(() => {
     if (user) {
       fetchSettings()
     }
   }, [user])

   const fetchSettings = async () => {
     try {
       const [companyResponse, systemResponse, billingResponse, notificationResponse, backupResponse] = await Promise.all([
         fetch(`${API_URL}/settings/company`, {
           headers: {
             "Content-Type": "application/json",
             Accept: "application/json",
             Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
           },
         }),
         fetch(`${API_URL}/settings/system`, {
           headers: {
             "Content-Type": "application/json",
             Accept: "application/json",
             Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
           },
         }),
         fetch(`${API_URL}/settings/billing`, {
           headers: {
             "Content-Type": "application/json",
             Accept: "application/json",
             Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
           },
         }),
         fetch(`${API_URL}/settings/notifications`, {
           headers: {
             "Content-Type": "application/json",
             Accept: "application/json",
             Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
           },
         }),
         fetch(`${API_URL}/settings/backup`, {
           headers: {
             "Content-Type": "application/json",
             Accept: "application/json",
             Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
           },
         }),
       ])

       if (companyResponse.ok) {
         const companyData = await companyResponse.json()
         setCompanyName(companyData.name || "Pinturería Taragüí")
         setCompanyEmail(companyData.email || "info@taragui.com")
         setCompanyPhone(companyData.phone || "+54 379 4567890")
         setCompanyAddress(companyData.address || "Av. 3 de Abril 1234, Corrientes")
       }

       if (systemResponse.ok) {
         const systemData = await systemResponse.json()
         setLanguage(systemData.language || "es")
         setTimezone(systemData.timezone || "America/Argentina/Buenos_Aires")
         setCurrency(systemData.currency || "ARS")
       }

       if (billingResponse.ok) {
         const billingData = await billingResponse.json()
         // Update billing state variables
       }

       if (notificationResponse.ok) {
         const notificationData = await notificationResponse.json()
         setEmailNotifications(notificationData.email_notifications || true)
         setLowStockAlerts(notificationData.low_stock_alerts || true)
         setSalesNotifications(notificationData.sales_notifications || true)
         setSystemUpdates(notificationData.system_updates || false)
       }

       if (backupResponse.ok) {
         const backupData = await backupResponse.json()
         // Update backup state variables
       }
     } catch (error) {
       console.error("Error fetching settings:", error)
     } finally {
       setLoadingData(false)
     }
   }

   if (authLoading) {
     return <div>Cargando...</div>
   }

   if (!user) {
     return null
   }

   // Company Settings
  const [companyName, setCompanyName] = useState("Pinturería Taragüí")
  const [companyEmail, setCompanyEmail] = useState("info@taragui.com")
  const [companyPhone, setCompanyPhone] = useState("+54 379 4567890")
  const [companyAddress, setCompanyAddress] = useState("Av. 3 de Abril 1234, Corrientes")

  // System Settings
  const [language, setLanguage] = useState("es")
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires")
  const [currency, setCurrency] = useState("ARS")

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [salesNotifications, setSalesNotifications] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(false)

  // Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    try {
      let url = ""
      let data = {}

      switch (section) {
        case "empresa":
          url = `${API_URL}/settings/company`
          data = {
            name: companyName,
            email: companyEmail,
            phone: companyPhone,
            address: companyAddress,
          }
          break
        case "sistema":
          url = `${API_URL}/settings/system`
          data = {
            language,
            timezone,
            currency,
          }
          break
        case "notificaciones":
          url = `${API_URL}/settings/notifications`
          data = {
            email_notifications: emailNotifications,
            low_stock_alerts: lowStockAlerts,
            sales_notifications: salesNotifications,
            system_updates: systemUpdates,
          }
          break
        default:
          throw new Error("Sección no reconocida")
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al guardar configuración")
      }

      toast({
        title: "Configuración guardada",
        description: `Los ajustes de ${section} se guardaron correctamente.`,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackupDatabase = () => {
    toast({
      title: "Respaldo iniciado",
      description: "El respaldo de la base de datos se está generando...",
    })
    // Implementar lógica de backup
  }

  const handleRestoreDatabase = () => {
    toast({
      title: "Restauración iniciada",
      description: "Selecciona un archivo de respaldo para restaurar.",
    })
    // Implementar lógica de restore
  }

  if (loadingData) {
    return (
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Cargando configuración...</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
              <p className="text-muted-foreground mt-1">Configura tu sistema ERP y preferencias</p>
            </div>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <Receipt className="h-4 w-4" />
                Facturación
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Globe className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Seguridad
              </TabsTrigger>
              <TabsTrigger value="backup" className="gap-2">
                <Database className="h-4 w-4" />
                Respaldos
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Plug className="h-4 w-4" />
                Integraciones
              </TabsTrigger>
            </TabsList>

            {/* Empresa */}
            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Empresa</CardTitle>
                  <CardDescription>Datos básicos de tu negocio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nombre de la Empresa</Label>
                      <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <Input
                        id="company-phone"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-cuit">CUIT</Label>
                      <Input id="company-cuit" placeholder="20-12345678-9" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-address">Dirección</Label>
                    <Input
                      id="company-address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="company-logo">Logo de la Empresa</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Upload className="h-4 w-4" />
                        Subir Logo
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSaveSettings("empresa")} disabled={isLoading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Usuarios */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios del sistema y sus permisos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Usuarios Activos</h4>
                      <p className="text-sm text-muted-foreground">5 usuarios con acceso al sistema</p>
                    </div>
                    <Button className="gap-2">
                      <Users className="h-4 w-4" />
                      Agregar Usuario
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {[
                      { name: "Admin Principal", email: "admin@taragui.com", role: "Administrador", status: "Activo" },
                      { name: "Juan Pérez", email: "juan@taragui.com", role: "Vendedor", status: "Activo" },
                      { name: "María García", email: "maria@taragui.com", role: "Contador", status: "Activo" },
                      { name: "Carlos López", email: "carlos@taragui.com", role: "Almacenero", status: "Activo" },
                    ].map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{user.role}</p>
                            <p className="text-xs text-green-600">{user.status}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Roles y Permisos</CardTitle>
                  <CardDescription>Define qué puede hacer cada rol</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { role: "Administrador", permissions: "Acceso total al sistema" },
                    { role: "Vendedor", permissions: "Ventas, Clientes (solo lectura inventario)" },
                    { role: "Contador", permissions: "Reportes, Facturación, Finanzas" },
                    { role: "Almacenero", permissions: "Inventario, Movimientos de stock" },
                  ].map((role, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{role.role}</p>
                        <p className="text-xs text-muted-foreground">{role.permissions}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        Configurar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Facturación */}
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Facturación</CardTitle>
                  <CardDescription>Configura tus datos de facturación y preferencias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-prefix">Prefijo de Factura</Label>
                      <Input id="invoice-prefix" placeholder="FAC" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-number">Número Inicial</Label>
                      <Input id="invoice-number" type="number" placeholder="1000" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="payment-terms">Términos de Pago (días)</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="payment-terms">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Inmediato</SelectItem>
                          <SelectItem value="15">15 días</SelectItem>
                          <SelectItem value="30">30 días</SelectItem>
                          <SelectItem value="60">60 días</SelectItem>
                          <SelectItem value="90">90 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tasa de IVA (%)</Label>
                      <Select defaultValue="21">
                        <SelectTrigger id="tax-rate">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21">21%</SelectItem>
                          <SelectItem value="10.5">10.5%</SelectItem>
                          <SelectItem value="0">Exento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Opciones de Factura</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Incluir Logo en Facturas</Label>
                        <p className="text-sm text-muted-foreground">Mostrar logo de la empresa</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Envío Automático por Email</Label>
                        <p className="text-sm text-muted-foreground">Enviar factura al cliente</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Facturación Electrónica (AFIP)</Label>
                        <p className="text-sm text-muted-foreground">Integración con AFIP</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSaveSettings("facturación")} disabled={isLoading} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificaciones */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>Elige qué notificaciones quieres recibir</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones en tu correo</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Alertas del Sistema</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Stock Bajo</Label>
                        <p className="text-sm text-muted-foreground">Cuando productos lleguen al mínimo</p>
                      </div>
                      <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones de Ventas</Label>
                        <p className="text-sm text-muted-foreground">Cuando se registre una nueva venta</p>
                      </div>
                      <Switch checked={salesNotifications} onCheckedChange={setSalesNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Actualizaciones del Sistema</Label>
                        <p className="text-sm text-muted-foreground">Notificar sobre actualizaciones</p>
                      </div>
                      <Switch checked={systemUpdates} onCheckedChange={setSystemUpdates} />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSaveSettings("notificaciones")} disabled={isLoading} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Preferencias
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sistema */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                  <CardDescription>Ajustes generales de idioma, zona horaria y formato</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                          <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="BRL">Real Brasileño (BRL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Formato de Fecha</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger id="date-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Información del Sistema</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versión:</span>
                        <span className="font-medium">v2.4.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última Actualización:</span>
                        <span className="font-medium">15/01/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base de Datos:</span>
                        <span className="font-medium">PostgreSQL 15.2</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSaveSettings("sistema")} disabled={isLoading} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguridad */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad y Privacidad</CardTitle>
                  <CardDescription>Protege tu cuenta y datos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticación de Dos Factores (2FA)</Label>
                      <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad</p>
                    </div>
                    <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger id="session-timeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Cambiar Contraseña</h4>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Contraseña Actual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button variant="outline">Cambiar Contraseña</Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sesiones Activas</h4>
                    <p className="text-sm text-muted-foreground">Dispositivos con acceso a tu cuenta</p>
                    <div className="space-y-2 pt-2">
                      {[
                        { device: "Chrome en Windows", location: "Corrientes, Argentina", date: "Activa ahora" },
                        { device: "Safari en iPhone", location: "Corrientes, Argentina", date: "Hace 2 horas" },
                      ].map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{session.device}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.location} • {session.date}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Cerrar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSaveSettings("seguridad")} disabled={isLoading} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Respaldos */}
            <TabsContent value="backup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Respaldo y Restauración</CardTitle>
                  <CardDescription>Protege tus datos con respaldos automáticos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                      <h4 className="text-sm font-medium">Último Respaldo</h4>
                      <p className="text-sm text-muted-foreground">15/01/2025 - 03:00 AM</p>
                    </div>
                    <Button onClick={handleBackupDatabase} className="gap-2">
                      <Download className="h-4 w-4" />
                      Descargar
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleBackupDatabase} className="flex-1 gap-2">
                      <Database className="h-4 w-4" />
                      Crear Respaldo Ahora
                    </Button>
                    <Button onClick={handleRestoreDatabase} variant="outline" className="flex-1 gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Restaurar Respaldo
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Configuración Automática</h4>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Respaldos Automáticos</Label>
                        <p className="text-sm text-muted-foreground">Crear respaldos diarios</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-time">Hora de Respaldo</Label>
                      <Input id="backup-time" type="time" defaultValue="03:00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-retention">Retención (días)</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="backup-retention">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 días</SelectItem>
                          <SelectItem value="30">30 días</SelectItem>
                          <SelectItem value="60">60 días</SelectItem>
                          <SelectItem value="90">90 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Historial de Respaldos</h4>
                    <div className="space-y-2">
                      {[
                        { date: "15/01/2025 03:00", size: "124.5 MB", status: "Completo" },
                        { date: "14/01/2025 03:00", size: "123.8 MB", status: "Completo" },
                        { date: "13/01/2025 03:00", size: "122.1 MB", status: "Completo" },
                      ].map((backup, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{backup.date}</p>
                              <p className="text-xs text-muted-foreground">
                                {backup.size} • {backup.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integraciones */}
            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integraciones y APIs</CardTitle>
                  <CardDescription>Conecta tu ERP con servicios externos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      {
                        name: "Mercado Pago",
                        description: "Procesa pagos online",
                        status: "connected",
                        icon: "💳",
                      },
                      {
                        name: "AFIP (Facturación Electrónica)",
                        description: "Integración con sistema de facturación",
                        status: "disconnected",
                        icon: "📄",
                      },
                      {
                        name: "WhatsApp Business",
                        description: "Notificaciones por WhatsApp",
                        status: "connected",
                        icon: "💬",
                      },
                      {
                        name: "Google Analytics",
                        description: "Análisis de ventas y tráfico",
                        status: "disconnected",
                        icon: "📊",
                      },
                    ].map((integration, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <p className="text-sm font-medium">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Button variant={integration.status === "connected" ? "outline" : "default"} size="sm">
                          {integration.status === "connected" ? "Desconectar" : "Conectar"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">API Keys</h4>
                    <p className="text-sm text-muted-foreground">
                      Genera claves de API para integrar tu ERP con aplicaciones externas
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Input placeholder="API Key" value="pk_live_51H..." readOnly />
                      <Button variant="outline">Regenerar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
