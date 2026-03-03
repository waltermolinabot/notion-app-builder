'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEFAULT_ROLE_PERMISSIONS, type Permission, type RoleName } from '@/lib/permissions';

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  userRoles: { id: string; email: string }[];
  createdAt: string;
}

interface RoleManagerProps {
  appId: string;
}

export function RoleManager({ appId }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState<RoleName>('viewer');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchRoles();
  }, [appId]);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/roles?appId=${appId}`);
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          name: newRoleName,
          permissions: selectedPermissions,
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setNewRoleName('viewer');
        setSelectedPermissions([]);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: selectedRole.id,
          name: selectedRole.name,
          permissions: selectedPermissions,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        setSelectedRole(null);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const res = await fetch(`/api/roles?id=${roleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
    setIsEditOpen(true);
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const getRoleBadgeColor = (name: string) => {
    switch (name) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const permissionCategories: { label: string; permissions: Permission[] }[] = [
    {
      label: 'App',
      permissions: ['app:read', 'app:write', 'app:delete', 'app:publish'],
    },
    {
      label: 'Data Source',
      permissions: [
        'datasource:read',
        'datasource:write',
        'datasource:delete',
        'datasource:sync',
      ],
    },
    {
      label: 'Blocks',
      permissions: ['block:read', 'block:write', 'block:delete'],
    },
    {
      label: 'Roles',
      permissions: ['role:read', 'role:write', 'role:delete'],
    },
    {
      label: 'Users',
      permissions: ['user:invite', 'user:remove'],
    },
    {
      label: 'Data',
      permissions: ['data:read', 'data:write', 'data:delete'],
    },
  ];

  if (loading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Roles & Permissions</h2>
          <p className="text-slate-500">Manage roles and access control for your app</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value as RoleName);
                    setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS[e.target.value as RoleName] || []);
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                  {permissionCategories.map((category) => (
                    <div key={category.label} className="mb-4">
                      <h4 className="font-medium text-sm mb-2">{category.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant={selectedPermissions.includes(permission) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => togglePermission(permission)}
                          >
                            {permission.replace(/^[^:]+:/, '')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </CardTitle>
              <Badge className={getRoleBadgeColor(role.name)}>{role.name}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="h-4 w-4" />
                  <span>{role.userRoles.length} users</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm.replace(/^[^:]+:/, '')}
                    </Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Modify role permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input value={selectedRole?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                {permissionCategories.map((category) => (
                  <div key={category.label} className="mb-4">
                    <h4 className="font-medium text-sm mb-2">{category.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant={selectedPermissions.includes(permission) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => togglePermission(permission)}
                        >
                          {permission.replace(/^[^:]+:/, '')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
