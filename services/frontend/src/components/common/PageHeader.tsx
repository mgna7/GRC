import { ReactNode } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

type PageHeaderProps = {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

export const PageHeader = ({ title, subtitle, backTo, backLabel = 'Back', actions }: PageHeaderProps) => {
  const navigate = useNavigate()

  return (
    <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
      <Stack spacing={0.5}>
        {backTo && (
          <Button variant="text" size="small" onClick={() => navigate(backTo)} sx={{ alignSelf: 'flex-start', px: 0 }}>
            ← {backLabel}
          </Button>
        )}
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {actions && <Box display="flex" gap={1}>{actions}</Box>}
    </Stack>
  )
}
