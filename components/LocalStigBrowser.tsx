'use client';

import { useState, useEffect } from 'react';
import { Database, Download, RefreshCw } from 'lucide-react';

interface LocalStigMetadata {
  stigId: string;
  name: string;
  version: string;
  releaseDate: string;
  filename: string;
  format?: 'xml' | 'csv';
}

interface LocalStigBrowserProps {
  onImport: (stigId: string) => void;
}

export default function LocalStigBrowser({ onImport }: LocalStigBrowserProps) {
  const [stigs, setStigs] = useState<LocalStigMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const fetchLocalStigs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/local-stigs');
      const data = await response.json();
      
      if (data.success) {
        setStigs(data.stigs);
      } else {
        setError(data.error || 'Failed to load local STIGs');
      }
    } catch (err) {
      setError('Error connecting to local STIG library');
      console.error('Error fetching local STIGs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalStigs();
  }, []);

  const handleImport = async (stigId: string) => {
    setImporting(stigId);
    try {
      await onImport(stigId);
    } finally {
      setImporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        <span className="text-blue-700">Loading local STIG library...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 mb-2">⚠️ {error}</p>
        <button
          onClick={fetchLocalStigs}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (stigs.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <Database className="mr-3 h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">No Local STIGs Found</h3>
            <p className="text-sm text-gray-600 mb-3">
              To use the local STIG library, extract STIG files to the <code className="bg-gray-200 px-1 rounded">public/stigs/</code> directory.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Expected structure:</p>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
{`public/stigs/
├── apache_server_2.4_unix/
│   ├── U_Apache_2-4_UNIX_V2R5_STIG.xml
│   └── metadata.json
└── windows_server_2022/
    ├── U_MS_Windows_Server_2022_V1R4_STIG.xml
    └── metadata.json`}
              </pre>
            </div>
            <button
              onClick={fetchLocalStigs}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">
            Local STIG Library ({stigs.length} {stigs.length === 1 ? 'STIG' : 'STIGs'})
          </h3>
        </div>
        <button
          onClick={fetchLocalStigs}
          className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="grid gap-3">
        {stigs.map((stig) => (
          <div
            key={stig.stigId}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{stig.name}</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {stig.stigId}
                    </span>
                  </p>
                  <p>Version: {stig.version} • Released: {stig.releaseDate}</p>
                  <p>
                    Format: <span className="uppercase font-semibold">{stig.format || 'xml'}</span> • 
                    File: {stig.filename}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleImport(stig.stigId)}
                disabled={importing === stig.stigId}
                className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-colors ${
                  importing === stig.stigId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {importing === stig.stigId ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> Local STIGs are faster and work offline. Add more STIGs by extracting 
          files to <code className="bg-blue-100 px-1 rounded">public/stigs/[stigId]/</code>
        </p>
      </div>
    </div>
  );
}
