/**
 * Converts a standard DB timestamp or YYYY-MM-DD format into display-friendly MM/DD/YYYY
 */
export const formatDate = (dateStr) => {
  if (!dateStr || !dateStr.includes('-')) return 'N/A'
  const [year, month, day] = dateStr.split(' ')[0].split('-')
  return `${month}/${day}/${year}`
}

/**
 * Converts a display-style string (MM/DD/YYYY) back into standard database-ready ISO string (YYYY-MM-DD)
 */
export const convertToISODate = (displayDateStr) => {
  if (!displayDateStr || displayDateStr === 'N/A') return ''
  const parts = displayDateStr.split('/')
  if (parts.length !== 3) return ''
  const [month, day, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}