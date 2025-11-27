'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PaintBucket } from "lucide-react"
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <div>Cargando...</div>
  }

  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      setErrorMessage(null)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      })
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : "Credenciales inválidas"
      setErrorMessage(message)
      toast({
        title: "Error de inicio de sesión",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary rounded-lg p-3">
              <PaintBucket className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance text-center">Pinturería Taragüí</h1>
          <p className="text-muted-foreground text-sm mt-1">Sistema de Gestión Empresarial</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingrese sus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingrese su email"
                  className="h-11"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrorMessage(null)
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    ¿Olvidó su contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  className="h-11"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMessage(null)
                  }}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Acceder'}
              </Button>
            </form>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Pinturería Taragüí. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
