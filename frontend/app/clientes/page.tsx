"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ClientesTable, ClienteModal } from "@/components/clientes-table";
import { useUsers } from "@/hooks/use-users";

interface User {
  id: number;
  name: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  role: string | null;
  active: boolean;
}

export default function ClientesPage() {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleSaveUser = async (userData: Omit<User, 'id' | 'role' | 'active'> & { password?: string; role?: string; active?: boolean }) => {
    try {
      if (editingUser) {
        // Editar usuario existente
        await updateUser(editingUser.id, userData);
        toast({
          title: "Usuario actualizado",
          description: "Los datos del usuario han sido actualizados.",
        });
      } else {
        // Crear nuevo usuario
        await createUser(userData as any);
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido creado exitosamente.",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el usuario.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 font-semibold">Error al cargar clientes</p>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra la información de tus usuarios, realiza búsquedas y gestiona sus datos.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Button onClick={handleAddUser} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </div>
      </div>

      <ClientesTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  );
}