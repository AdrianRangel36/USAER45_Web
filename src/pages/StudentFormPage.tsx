import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentForm } from '@/components/students/StudentForm'
import { api, getApiErrorMessage } from '@/lib/api'
import type { User } from '@/types'

export function StudentFormPage() {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<User[]>('/users')
      .then(({ data }) =>
        setTeachers(data.filter((u) => u.role === 'DOCENTE' && u.isActive)),
      )
      .catch((err) => setError(getApiErrorMessage(err)))
  }, [])

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo alumno</h1>
        <p className="text-muted-foreground">
          Registra a un alumno del programa USAER 45J
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <StudentForm
        mode="create"
        teachers={teachers}
        onSuccess={(student) => navigate(`/alumnos/${student.id}`)}
        onCancel={() => navigate('/alumnos')}
      />
    </div>
  )
}
