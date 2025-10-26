import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Link, Stack, Typography } from '@mui/material'
import { AuthShell } from '../components/AuthShell'
import { AppTextField } from '../../../components/common/AppTextField'
import { AppButton } from '../../../components/common/AppButton'
import { useAuth } from '../../../contexts/AuthContext'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Unable to login'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="ComplianceIQ"
      subtitle="Accelerate your compliance operations with real-time analytics and automation"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Typography variant="h4">Welcome Back</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to your dashboard
          </Typography>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <AppTextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AppTextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AppButton type="submit" loading={loading}>
          Sign In
        </AppButton>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Need an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Create one
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  )
}
