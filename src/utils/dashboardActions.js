import html2pdf from 'html2pdf.js'
import { downloadCSV } from './exportUtils.js'

/**
 * Universal PDF Generator - Handles Layouts, Tables, and Charts across all views
 */
export const exportToPDF = (activeSelection, elementSelector = '.visualization-grid', isLandscape = true) => {
  const element = document.querySelector(elementSelector)
  if (!element) return alert(`⚠️ Target element '${elementSelector}' node not found.`)

  const options = {
    margin:       [0.4, 0.4, 0.4, 0.4], 
    filename:     `${activeSelection?.area || 'sodaco'}_report.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },  
    html2canvas:  { 
      scale: 2, useCORS: true, logging: false, windowWidth: 1280,
      onclone: (clonedDoc) => {
        const el = clonedDoc.querySelector(elementSelector)
        if (el) { el.style.width = '100%'; el.style.height = 'auto'; el.style.overflow = 'visible'; }
      }
    },
    jsPDF: { unit: 'in', format: 'letter', orientation: isLandscape ? 'landscape' : 'portrait' }
  }

  html2pdf().set(options).from(element).save()
}

export const buildCSVContextBlock = (area, sys, min, max) => ({
  'Exported Area': area || 'global', 'Exported System Module': sys || 'operations',
  'Filter Start Date': min || 'N/A', 'Filter End Date': max || 'N/A'
})

export const executeCSVExportPipeline = async (activeSelection, fetchRawExportDatasetFn) => {
  const { area: targetArea = 'global', systemType: targetSystem = 'operations', isoMinDate: minDate, isoMaxDate: maxDate } = activeSelection
  const nameString = `${targetArea}-${targetSystem}-audit-log`.toLowerCase().replace(/\s+/g, '_')
  const rawRecords = await fetchRawExportDatasetFn(targetArea, targetSystem, minDate, maxDate)

  if (!rawRecords?.length) return alert('⚠️ No transactional history discovered within the selected parameters.')

  const header = buildCSVContextBlock(targetArea, targetSystem, minDate, maxDate)
  downloadCSV(rawRecords.map(row => ({ ...header, ...row })), nameString)
}