import { format } from 'date-fns'

export const formatDateTime = (value) => {
  if (!value) return 'Unknown'
  return format(new Date(value), 'PPpp')
}
