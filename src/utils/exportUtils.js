/**
 * Converts an array of objects into a CSV file and triggers a browser download.
 * @param {Array} data - The active data array
 * @param {String} filename - The preferred name of the downloaded file
 */
export function downloadCSV(data, filename = 'portal-data-export') {
  if (!data || !data.length) {
    alert('⚠️ No active data available to export.')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows = []
  
  csvRows.push(headers.map(header => `"${header.toUpperCase()}"`).join(','))

  for (const row of data) {
    const values = headers.map(header => {
      const cellValue = row[header] ?? ''
      const escaped = String(cellValue).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}