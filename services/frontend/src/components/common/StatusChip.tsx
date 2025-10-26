import { Chip, ChipProps } from '@mui/material'

type StatusChipProps = ChipProps & {
  status: 'success' | 'warning' | 'error' | 'info'
  label: string
}

export const StatusChip = ({ status, label, ...props }: StatusChipProps) => (
  <Chip label={label} color={status} variant="outlined" size="small" sx={{ textTransform: 'capitalize' }} {...props} />
)
