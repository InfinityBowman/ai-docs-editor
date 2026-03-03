import { useState } from 'react'

function ExportButton({ activeFile, format = 'docx' }) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  const label = format === 'pdf' ? 'PDF' : 'DOCX'

  const handleExport = async () => {
    if (!activeFile) return

    setExporting(true)
    setError(null)

    try {
      const response = await fetch(`/api/export/${encodeURIComponent(activeFile)}?format=${format}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeFile.replace(/\.md$/, `.${format}`)
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err.message)
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={!activeFile || exporting}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? 'Exporting...' : `Export to ${label}`}
      </button>
      {error && (
        <div className="absolute top-full mt-2 right-0 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}

export default ExportButton
