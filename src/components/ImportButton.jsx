import { useState, useRef } from 'react';

function ImportButton({ onImport }) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      // Notify parent to refresh file list and select the imported file
      if (onImport) {
        onImport(data.fileName);
      }
    } catch (err) {
      setError(err.message);
      console.error('Import error:', err);
    } finally {
      setImporting(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFileChange} className="hidden" />
      <button
        onClick={handleClick}
        disabled={importing}
        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {importing ? 'Importing...' : 'Import DOCX'}
      </button>
      {error && (
        <div className="absolute top-full mt-2 right-0 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}

export default ImportButton;
