import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Grid, Link, Stack, Typography } from '@mui/material'
import { AuthShell } from '../components/AuthShell'
import { AppTextField } from '../../../components/common/AppTextField'
import { AppButton } from '../../../components/common/AppButton'
import { useAuth } from '../../../contexts/AuthContext'

export const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        organizationName,
      })
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Get started with ComplianceIQ"
      subtitle="Create your workspace and connect your ServiceNow instances in minutes"
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Typography variant="h4">Create account</Typography>
          <Typography variant="body2" color="text.secondary">
            Join teams automating governance, risk, and compliance workflows
          </Typography>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <AppTextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Grid>
        </Grid>
        <AppTextField
          label="Organization"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />
        <AppTextField
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <AppTextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Use at least 8 characters with a mix of cases"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <AppTextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Grid>
        </Grid>
        <AppButton type="submit" loading={loading}>
          Create account
        </AppButton>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  )
}
