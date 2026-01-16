import { useState, useEffect, useCallback, useRef } from 'react';
import DocumentSwitcher from './components/DocumentSwitcher';
import Preview from './components/Preview';
import ExportButton from './components/ExportButton';
import ImportButton from './components/ImportButton';

function App() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files);
      if (data.files.length > 0 && !activeFile) {
        setActiveFile(data.files[0]);
      }
    } catch (err) {
      setError('Failed to fetch files');
      console.error(err);
    }
  }, [activeFile]);

  const fetchContent = useCallback(async () => {
    if (!activeFile) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/files/${encodeURIComponent(activeFile)}`);
      const data = await response.json();
      setContent(data.content);
      setError(null);
    } catch (err) {
      setError('Failed to fetch file content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFile]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Use refs to access latest values without causing WebSocket reconnection
  const activeFileRef = useRef(activeFile);
  const fetchContentRef = useRef(fetchContent);
  const fetchFilesRef = useRef(fetchFiles);

  useEffect(() => {
    activeFileRef.current = activeFile;
    fetchContentRef.current = fetchContent;
    fetchFilesRef.current = fetchFiles;
  }, [activeFile, fetchContent, fetchFiles]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3005/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'file-change') {
        if (data.file === activeFileRef.current) {
          // Save scroll position before refetching content
          sessionStorage.setItem('scrollPosition', window.scrollY.toString());
          fetchContentRef.current();
        }
        fetchFilesRef.current();
      }
    };

    return () => {
      ws.close();
    };
  }, []); // Empty deps - WebSocket stays connected

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">AI Docs Editor</h1>
          <div className="flex items-center gap-4">
            <DocumentSwitcher files={files} activeFile={activeFile} onSelect={setActiveFile} />
            <ImportButton
              onImport={(fileName) => {
                fetchFiles().then(() => setActiveFile(fileName));
              }}
            />
            <ExportButton activeFile={activeFile} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No markdown files found.</p>
            <p className="text-gray-400 text-sm">
              Add <code className="bg-gray-100 px-1 rounded">.md</code> files to the <code className="bg-gray-100 px-1 rounded">docs/</code>{' '}
              folder.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Preview content={content} />
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-400">
        Edit files with your AI tool of choice. Preview updates automatically.
      </footer>
    </div>
  );
}

export default App;
