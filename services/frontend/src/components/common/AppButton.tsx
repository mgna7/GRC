import { Button, ButtonProps, CircularProgress } from '@mui/material'

type AppButtonProps = ButtonProps & {
  loading?: boolean
}

export const AppButton = ({ children, loading = false, disabled, ...rest }: AppButtonProps) => (
  <Button
    variant="contained"
    size="large"
    fullWidth
    disabled={loading || disabled}
    {...rest}
  >
    {loading ? <CircularProgress size={20} color="inherit" /> : children}
  </Button>
)
