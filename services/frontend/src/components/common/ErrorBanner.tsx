import { Alert, AlertTitle, Button } from '@mui/material'

type ErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
  <Alert severity="error" action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Retry</Button> : undefined}>
    <AlertTitle>Something went wrong</AlertTitle>
    {message}
  </Alert>
)
