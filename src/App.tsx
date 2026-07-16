import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/routes'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors />
    </>
  )
}

export default App
