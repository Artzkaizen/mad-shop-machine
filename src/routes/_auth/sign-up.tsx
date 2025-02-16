import { LoginForm } from '@/components/auth-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-up')({
  component: LoginForm,
})

