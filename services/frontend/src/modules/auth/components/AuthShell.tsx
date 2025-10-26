import { ReactNode } from 'react'
import { Grid, Paper, Stack, Typography } from '@mui/material'

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export const AuthShell = ({ title, subtitle, children }: AuthShellProps) => (
  <Grid container sx={{ minHeight: '100vh' }}>
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
      }}
    >
      <Stack spacing={3} maxWidth={420}>
        <Typography variant="h2">{title}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          {subtitle}
        </Typography>
      </Stack>
    </Grid>
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Paper elevation={12} sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        {children}
      </Paper>
    </Grid>
  </Grid>
)
