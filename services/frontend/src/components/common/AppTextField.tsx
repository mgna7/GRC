import { TextField, TextFieldProps } from '@mui/material'

export const AppTextField = (props: TextFieldProps) => (
  <TextField
    fullWidth
    margin="normal"
    size="medium"
    {...props}
  />
)
