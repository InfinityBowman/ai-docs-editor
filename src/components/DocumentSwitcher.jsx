function DocumentSwitcher({ files, activeFile, onSelect }) {
  if (files.length === 0) {
    return null
  }

  return (
    <select
      value={activeFile || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {files.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </select>
  )
}

export default DocumentSwitcher
