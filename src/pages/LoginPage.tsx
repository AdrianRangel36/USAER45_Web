import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth.store'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { token, loading, error, login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from: string = location.state?.from?.pathname ?? '/'

  if (token) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      // El mensaje de error ya quedó en el store.
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center justify-items-center gap-3 text-center">
          <img
            src="/usaer_icon.jpeg"
            alt="Logo USAER 45J"
            className="size-20 rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
          />
          <CardTitle>Sistema USAER 45J</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta institucional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ¿No tienes cuenta? Solicítala al administrador de la unidad.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
