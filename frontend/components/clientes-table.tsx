"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_registro: string;
  total_compras: number;
  avatar?: string;
}

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export function ClientesTable({ clientes, onEdit, onDelete }: ClientesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="space-y-2">
          <CardTitle>Lista de Clientes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestiona y visualiza la información de todos tus clientes
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-3">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={cliente.avatar || "/placeholder-user.jpg"} alt={cliente.nombre} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-medium">{cliente.nombre}</div>
                    <div className="text-sm text-muted-foreground">{cliente.email}</div>
                    <div className="text-xs text-muted-foreground">{cliente.telefono}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="secondary">
                    ${cliente.total_compras.toFixed(2)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Registrado: {new Date(cliente.fecha_registro).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs truncate">
                    {cliente.direccion}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(cliente)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(cliente.id)}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {filteredClientes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron clientes
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ClienteModal({
  isOpen,
  onClose,
  onSave,
  cliente = null
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Cliente, 'id' | 'fecha_registro' | 'total_compras'>) => void;
  cliente?: Cliente | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
          <CardDescription>
            {cliente ? 'Actualiza la información del cliente' : 'Ingresa los datos del nuevo cliente'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const clienteData = {
              nombre: formData.get('nombre') as string,
              email: formData.get('email') as string,
              telefono: formData.get('telefono') as string,
              direccion: formData.get('direccion') as string,
            };
            onSave(clienteData);
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={cliente?.nombre || ''}
                required
                placeholder="Nombre completo del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={cliente?.email || ''}
                required
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                defaultValue={cliente?.telefono || ''}
                required
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                defaultValue={cliente?.direccion || ''}
                required
                placeholder="Dirección completa"
              />
            </div>
            <Separator />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {cliente ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}