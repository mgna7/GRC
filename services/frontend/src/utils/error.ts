export const getErrorMessage = (error: any, fallback = 'Something went wrong') => {
  if (!error) return fallback

  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail

  const messageField = error?.response?.data?.message
  if (typeof messageField === 'string') return messageField

  const responseData = error?.response?.data
  if (typeof responseData === 'string') return responseData

  if (typeof error.message === 'string') return error.message

  try {
    return JSON.stringify(responseData || error)
  } catch {
    return fallback
  }
}
