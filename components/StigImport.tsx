'use client';

import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileText, Globe, X } from 'lucide-react';

interface StigRequirement {
  vulnId: string;
  ruleId: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  checkText: string;
  fixText: string;
  cci: string[];
  nistControls: string[];
}

interface StigImportResult {
  success: boolean;
  stigId: string;
  stigName: string;
  version: string;
  releaseDate: string;
  requirements: StigRequirement[];
  totalRequirements: number;
  source: 'stigviewer' | 'manual' | 'cache';
  message?: string;
  error?: string;
  instructions?: {
    step1: string;
    step2: string;
    step3: string;
  };
}

export default function StigImport() {
  const [importMode, setImportMode] = useState<'fetch' | 'upload' | null>(null);
  const [stigId, setStigId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StigImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Popular STIGs for quick selection
  const popularStigs = [
    { id: 'apache_server_2.4_unix', name: 'Apache Server 2.4 Unix' },
    { id: 'microsoft_iis_10-0_server', name: 'Microsoft IIS 10.0 Server' },
    { id: 'ms_sql_server_2016_instance', name: 'MS SQL Server 2016 Instance' },
    { id: 'postgresql_9-x', name: 'PostgreSQL 9.x' },
    { id: 'red_hat_enterprise_linux_8', name: 'Red Hat Enterprise Linux 8' },
    { id: 'windows_server_2019', name: 'Windows Server 2019' },
    { id: 'application_security_and_development', name: 'Application Security and Development' },
    { id: 'nginx', name: 'NGINX' },
  ];

  const handleFetchFromStigViewer = async () => {
    if (!stigId.trim()) {
      setError('Please enter or select a STIG ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/import-stig?stigId=${encodeURIComponent(stigId)}`);
      const data: StigImportResult = await response.json();

      if (data.success) {
        setResult(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch STIG from stigviewer.com');
        setResult(data); // May contain instructions
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/import-stig', {
        method: 'POST',
        body: formData,
      });

      const data: StigImportResult = await response.json();

      if (data.success) {
        setResult(data);
        setError(null);
        setSelectedFile(null);
      } else {
        setError(data.error || 'Failed to parse STIG file');
      }
    } catch (err: any) {
      setError(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleApplyRequirements = () => {
    if (!result) return;

    // Store in localStorage or state management
    const existingRequirements = JSON.parse(localStorage.getItem('importedStigs') || '[]');
    existingRequirements.push(result);
    localStorage.setItem('importedStigs', JSON.stringify(existingRequirements));

    alert(`✅ Successfully imported ${result.totalRequirements} requirements from ${result.stigName}`);
    
    // Reset form
    setResult(null);
    setImportMode(null);
    setStigId('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Import STIG Requirements</h2>
        <p className="text-sm text-gray-600 mt-1">
          Fetch STIGs from stigviewer.com or upload XCCDF XML files manually
        </p>
      </div>

      {/* Mode Selection */}
      {!importMode && (
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setImportMode('fetch')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Fetch from STIGViewer</h3>
                <p className="text-sm text-gray-600">
                  Automatically download STIG requirements from stigviewer.com
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setImportMode('upload')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Manual Upload</h3>
                <p className="text-sm text-gray-600">
                  Upload XCCDF XML file from DISA or STIGViewer
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Fetch from STIGViewer Mode */}
      {importMode === 'fetch' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-600" />
              Fetch from STIGViewer.com
            </h3>
            <button
              onClick={() => {
                setImportMode(null);
                setError(null);
                setStigId('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select Popular STIGs:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {popularStigs.map((stig) => (
                <button
                  key={stig.id}
                  onClick={() => setStigId(stig.id)}
                  className={`text-left p-2 text-sm rounded border ${
                    stigId === stig.id
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {stig.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual STIG ID Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter STIG ID Manually:
            </label>
            <input
              type="text"
              value={stigId}
              onChange={(e) => setStigId(e.target.value)}
              placeholder="e.g., apache_server_2.4_unix"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Find STIG IDs at{' '}
              <a
                href="https://stigviewer.com/stigs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                stigviewer.com/stigs
              </a>
            </p>
          </div>

          <button
            onClick={handleFetchFromStigViewer}
            disabled={loading || !stigId.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching STIG...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Fetch STIG Requirements
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual Upload Mode */}
      {importMode === 'upload' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              Manual STIG Upload
            </h3>
            <button
              onClick={() => {
                setImportMode(null);
                setError(null);
                setSelectedFile(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload XCCDF XML File:
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              <input
                type="file"
                accept=".xml,.xccdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? (
                    <span className="font-medium text-green-600">{selectedFile.name}</span>
                  ) : (
                    <>
                      Click to select or drag and drop
                      <br />
                      <span className="text-xs">Accepts .xml and .xccdf files</span>
                    </>
                  )}
                </p>
              </label>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">📥 Where to get STIG files:</p>
              <ul className="text-blue-700 space-y-1 ml-4 list-disc">
                <li>
                  <a
                    href="https://public.cyber.mil/stigs/downloads/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    DISA Cyber Exchange
                  </a>{' '}
                  (Official source)
                </li>
                <li>
                  <a
                    href="https://stigviewer.com/stigs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    STIGViewer.com
                  </a>{' '}
                  (Community mirror)
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleFileUpload}
            disabled={loading || !selectedFile}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing File...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload and Parse STIG
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              
              {result?.instructions && (
                <div className="mt-3 text-sm text-red-700">
                  <p className="font-medium">📝 Manual Upload Instructions:</p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>{result.instructions.step1}</li>
                    <li>{result.instructions.step2}</li>
                    <li>{result.instructions.step3}</li>
                  </ol>
                  <button
                    onClick={() => {
                      setImportMode('upload');
                      setError(null);
                    }}
                    className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                  >
                    Switch to Manual Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">{result.stigName}</h3>
              <p className="text-sm text-green-700">{result.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-600">Version</p>
              <p className="font-semibold">{result.version}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-600">Release Date</p>
              <p className="font-semibold">{result.releaseDate}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-600">Requirements</p>
              <p className="font-semibold">{result.totalRequirements}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-600">Source</p>
              <p className="font-semibold capitalize">{result.source}</p>
            </div>
          </div>

          {/* Requirements Preview */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Requirements Preview (First 5):
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.requirements.slice(0, 5).map((req) => (
                <div key={req.vulnId} className="bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-mono text-gray-600">{req.vulnId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getSeverityColor(req.severity)}`}>
                      {req.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{req.title}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{req.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    {req.nistControls.slice(0, 3).map((control) => (
                      <span key={control} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {control}
                      </span>
                    ))}
                    {req.nistControls.length > 3 && (
                      <span className="text-xs text-gray-500">+{req.nistControls.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {result.requirements.length > 5 && (
              <p className="text-xs text-gray-600 mt-2 text-center">
                ... and {result.requirements.length - 5} more requirements
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleApplyRequirements}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Requirements
            </button>
            <button
              onClick={() => {
                setResult(null);
                setImportMode(null);
                setStigId('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!result && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">💡 Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Fetch from STIGViewer:</strong> Fastest method, automatically downloads requirements</li>
            <li>• <strong>Manual Upload:</strong> Use when fetch fails or for offline STIG files</li>
            <li>• <strong>XCCDF Format:</strong> Both methods accept XCCDF XML format from DISA</li>
            <li>• <strong>Imported STIGs:</strong> Saved locally and available for mapping to requirements</li>
          </ul>
        </div>
      )}
    </div>
  );
}
