// src/utils/dashboardActions.js
import html2pdf from 'html2pdf.js'
import { downloadCSV } from './exportUtils.js'

/**
 * Handles the PDF generation and layout overrides for printing
 */
export const exportToPDF = (activeSelection) => {
  const element = document.querySelector('.visualization-grid')
  
  if (!element) {
    alert('⚠️ Visualization canvas node not found.')
    return
  }

  const options = {
    margin:       [0.4, 0.4, 0.4, 0.4], 
    filename:     `${activeSelection?.area || 'sodaco'}_analytics_report.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },  
    html2canvas:  { 
      scale: 2,
      useCORS: true, 
      logging: false,
      windowWidth: 1280, 
      onclone: (clonedDoc) => {
        const clonedGrid = clonedDoc.querySelector('.visualization-grid')
        if (clonedGrid) {
          clonedGrid.style.width = '120%'        
          clonedGrid.style.transform = 'scale(0.8)' 
          clonedGrid.style.transformOrigin = 'top left'
          clonedGrid.style.height = 'auto'
          clonedGrid.style.overflow = 'visible'
        }
      }
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'landscape'
    }
  }

  html2pdf().set(options).from(element).save()
}

/**
 * Creates the contextual header block metadata for the CSV payload
 */
export const buildCSVContextBlock = (targetArea, targetSystem, minDate, maxDate) => {
  return {
    'Exported Area': targetArea || 'global',
    'Exported System Module': targetSystem || 'operations',
    'Filter Start Date': minDate || 'N/A',
    'Filter End Date': maxDate || 'N/A'
  }
}

/**
 * Orchestrates the full raw transactional history database extraction,
 * contextual tracking injection, and file download sequence.
 */
export const executeCSVExportPipeline = async (activeSelection, fetchRawExportDatasetFn) => {
  const targetArea = activeSelection.area || 'global'
  const targetSystem = activeSelection.systemType || 'operations'
  const minDate = activeSelection.isoMinDate
  const maxDate = activeSelection.isoMaxDate
  
  const nameString = `${targetArea}-${targetSystem}-audit-log`.toLowerCase().replace(/\s+/g, '_')

  // Run the data layer query callback injected from the active analysis hook
  const rawTransactionalRecords = await fetchRawExportDatasetFn(targetArea, targetSystem, minDate, maxDate)

  if (!rawTransactionalRecords || !rawTransactionalRecords.length) {
    alert('⚠️ No transactional history discovered within the selected parameters.')
    return
  }

  // Inject tracking header data directly using the sibling metadata builder
  const contextHeaderBlock = buildCSVContextBlock(targetArea, targetSystem, minDate, maxDate)
  
  const finalizedAuditRows = rawTransactionalRecords.map(row => ({
    ...contextHeaderBlock,
    ...row
  }))

  // Trigger browser download handler script execution
  downloadCSV(finalizedAuditRows, nameString)
}