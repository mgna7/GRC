import { Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography, Button, Stack } from '@mui/material'
import { AnalysisRecord } from '../types'

type AnalysisOverviewProps = {
  analyses: AnalysisRecord[]
  onRunAnalysis: () => void
}

const statusColor = (status?: string) => {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'error'
  return 'warning'
}

export const AnalysisOverview = ({ analyses, onRunAnalysis }: AnalysisOverviewProps) => {
  const latest = analyses.slice(0, 5)
  return (
    <Card>
      <CardHeader
        title="Analysis Overview"
        subheader="Monitor the latest control, risk, and compliance runs"
        action={
          <Button variant="contained" onClick={onRunAnalysis}>
            Run Analysis
          </Button>
        }
      />
      <CardContent>
        {latest.length === 0 ? (
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="body1">No analyses yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Start by connecting an instance or launching your first assessment.
            </Typography>
            <Button variant="outlined" onClick={onRunAnalysis}>
              Launch Analysis
            </Button>
          </Stack>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Started</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {latest.map((analysis) => (
                <TableRow key={analysis.id} hover>
                  <TableCell>{analysis.title || analysis.id}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{analysis.analysis_type || 'Comprehensive'}</TableCell>
                  <TableCell>
                    <Chip
                      label={analysis.status || 'pending'}
                      color={statusColor(analysis.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {analysis.created_at ? new Date(analysis.created_at).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
