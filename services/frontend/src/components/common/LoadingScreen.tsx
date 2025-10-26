import { Box, CircularProgress, Typography } from '@mui/material'

export const LoadingScreen = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography variant="body1">Loading...</Typography>
  </Box>
)
