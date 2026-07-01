// src/utils/dataTransformers.js
import { formatDate } from './dateUtils.js'

/**
 * Transforms raw grouped summaries from the database into structured segments for the Sidebar tree layout.
 */
export const transformGroupedSummaryToSegments = (summaryData) => {
  const standardSystems = ['Production System', 'Material Management']
  if (!summaryData || summaryData.length === 0) return []
  
  const uniqueAreas = [...new Set(summaryData.map(item => item.area.trim()))]
  const UI_NAMES = { 'Production System': 'Production', 'Material Management': 'Material' }

  return uniqueAreas.map(areaName => {
    const systemsForThisArea = standardSystems.map(sysType => {
      const matchingRecord = summaryData.find(item => {
        return item.area.trim().toLowerCase() === areaName.trim().toLowerCase() && 
               item.systemType.trim().toLowerCase() === sysType.trim().toLowerCase()
      })
      
      return matchingRecord ? {
        systemType: sysType,
        displayName: UI_NAMES[sysType] || sysType,
        notAvailable: false,
        minDate: matchingRecord.minDate ? formatDate(matchingRecord.minDate) : 'N/A',
        maxDate: matchingRecord.maxDate ? formatDate(matchingRecord.maxDate) : 'N/A'
      } : { 
        systemType: sysType, 
        displayName: UI_NAMES[sysType] || sysType,
        notAvailable: true, 
        minDate: null, 
        maxDate: null 
      }
    })
    return { area: areaName, systems: systemsForThisArea }
  }).sort((a, b) => a.area.localeCompare(b.area))
}