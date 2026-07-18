import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api, getApiErrorMessage } from '@/lib/api'
import type { Role, User } from '@/types'

// Espejo de CreateUserDto del backend (POST /users, solo ADMIN):
// name, email, password (mínimo 8 caracteres) y role opcional.
interface NewUserForm {
  name: string
  email: string
  password: string
  role: Role
}

const EMPTY_FORM: NewUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'DOCENTE',
}

// Espejo de UpdateUserDto (PATCH /users/:id): no admite password, ya que el
// backend no expone un endpoint para restablecerla.
interface EditUserForm {
  name: string
  email: string
  role: Role
  isActive: boolean
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditUserForm | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  function loadUsers() {
    setLoading(true)
    api
      .get<User[]>('/users')
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setForm(EMPTY_FORM)
      setFormError(null)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const { data } = await api.post<User>('/users', form)
      setUsers((prev) => [...prev, data])
      handleOpenChange(false)
      toast.success(`Usuario ${data.name} registrado`)
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive ?? true,
    })
    setEditError(null)
  }

  function closeEdit(open: boolean) {
    if (!open) {
      setEditingUser(null)
      setEditForm(null)
      setEditError(null)
    }
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editingUser || !editForm) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      const { data } = await api.patch<User>(
        `/users/${editingUser.id}`,
        editForm,
      )
      setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
      closeEdit(false)
      toast.success(`Usuario ${data.name} actualizado`)
    } catch (err) {
      setEditError(getApiErrorMessage(err))
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleToggleActive(user: User) {
    setTogglingId(user.id)
    try {
      if (user.isActive) {
        await api.delete(`/users/${user.id}`)
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)),
        )
        toast.success(`Usuario ${user.name} desactivado`)
      } else {
        const { data } = await api.patch<User>(`/users/${user.id}`, {
          isActive: true,
        })
        setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
        toast.success(`Usuario ${user.name} reactivado`)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión de cuentas del sistema (solo administradores)
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Registrar usuario</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar nuevo usuario</DialogTitle>
              <DialogDescription>
                La cuenta se crea activa y podrá iniciar sesión de inmediato.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Nombre completo</Label>
                <Input
                  id="new-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Correo electrónico</Label>
                <Input
                  id="new-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Rol</Label>
                <Select
                  value={form.role}
                  onValueChange={(role) =>
                    setForm({ ...form, role: role as Role })
                  }
                >
                  <SelectTrigger id="new-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCENTE">Docente</SelectItem>
                    <SelectItem value="DIRECTIVO">Directivo(a)</SelectItem>
                    <SelectItem value="ADMIN">Administrador(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Registrando…' : 'Registrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'outline'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant={user.isActive ? 'destructive' : 'outline'}
                    size="sm"
                    disabled={togglingId === user.id}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.isActive ? 'Desactivar' : 'Reactivar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={editingUser !== null}
        onOpenChange={closeEdit}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              La contraseña no puede modificarse desde aquí.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input
                  id="edit-name"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Correo electrónico</Label>
                <Input
                  id="edit-email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(role) =>
                    setEditForm({ ...editForm, role: role as Role })
                  }
                >
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCENTE">Docente</SelectItem>
                    <SelectItem value="DIRECTIVO">Directivo(a)</SelectItem>
                    <SelectItem value="ADMIN">Administrador(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editError && (
                <p className="text-sm text-destructive" role="alert">
                  {editError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => closeEdit(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
