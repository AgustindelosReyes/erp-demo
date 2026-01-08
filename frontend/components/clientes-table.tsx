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

interface User {
  id: number;
  name: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  role: string | null;
  active: boolean;
}

interface ClientesTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export function ClientesTable({ users, onEdit, onDelete }: ClientesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.telefono && user.telefono.includes(searchTerm))
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
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.telefono || 'Sin teléfono'}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={user.active ? "default" : "secondary"}>
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Rol: {user.role || 'Sin rol'}
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs truncate">
                    {user.direccion || 'Sin dirección'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user.id)}
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron usuarios
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
  user = null
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<User, 'id' | 'role' | 'active'> & { password?: string; role?: string; active?: boolean }) => void;
  user?: User | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
          <CardDescription>
            {user ? 'Actualiza la información del usuario' : 'Ingresa los datos del nuevo usuario'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const userData = {
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              telefono: formData.get('telefono') as string,
              direccion: formData.get('direccion') as string,
              password: formData.get('password') as string || undefined,
              role: formData.get('role') as string || undefined,
              active: formData.get('active') === 'on',
            };
            onSave(userData);
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name || ''}
                required
                placeholder="Nombre completo del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ''}
                required
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                defaultValue={user?.telefono || ''}
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                defaultValue={user?.direccion || ''}
                placeholder="Dirección completa"
              />
            </div>
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!user}
                  placeholder="Contraseña"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                name="role"
                defaultValue={user?.role || ''}
                placeholder="Rol del usuario"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked={user?.active ?? true}
              />
              <Label htmlFor="active">Activo</Label>
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
                {user ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}