'use client';

import { useState } from 'react';
import { StigRequirement, StigImportResult } from '../types/srtm';
import { Upload, FileText, AlertCircle, CheckCircle, Filter, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

interface StigManagementProps {
  stigRequirements: StigRequirement[];
  onUpdate: (stigRequirements: StigRequirement[]) => void;
}

export default function StigManagement({ stigRequirements, onUpdate }: StigManagementProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<StigImportResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await parseStigCsv(text);
      setImportResult(result);
      
      if (result.success && result.stigRequirements.length > 0) {
        onUpdate([...stigRequirements, ...result.stigRequirements]);
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        errors: [`Failed to parse CSV file: ${error}`],
        stigRequirements: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const parseStigCsv = async (csvText: string): Promise<StigImportResult> => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const stigRequirements: StigRequirement[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      try {
        const values = parseCsvLine(lines[i]);
        const row: { [key: string]: string } = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index]?.replace(/"/g, '') || '';
        });

        // Map common STIG CSV column names to our structure
        const stigRequirement: StigRequirement = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          stigId: row['STIG_ID'] || row['Vuln_Num'] || row['Vuln ID'] || row['ID'] || `STIG-${i}`,
          vulnId: row['Vuln_Num'] || row['Vuln ID'] || row['Vulnerability ID'],
          groupId: row['Group_ID'] || row['Group ID'] || row['GroupID'],
          ruleId: row['Rule_ID'] || row['Rule ID'] || row['RuleID'],
          severity: (row['Severity'] || row['CAT'] || 'CAT III') as 'CAT I' | 'CAT II' | 'CAT III',
          title: row['Rule_Title'] || row['Title'] || row['Rule Title'] || row['Short_Title'] || `STIG Requirement ${i}`,
          description: row['Vuln_Discuss'] || row['Description'] || row['Discussion'] || 'No description provided',
          checkText: row['Check_Content'] || row['Check'] || row['Check Text'] || 'No check procedure provided',
          fixText: row['Fix_Text'] || row['Fix'] || row['Mitigation'] || 'No fix information provided',
          targetKey: row['Target_Key'] || row['TargetKey'],
          stigRef: row['STIG_Ref'] || row['STIG Reference'],
          cciRef: row['CCI_REF'] ? row['CCI_REF'].split(',').map(c => c.trim()) : undefined,
          applicability: 'Not Reviewed',
          status: 'Not Started',
          implementationStatus: 'Open',
          findings: '',
          comments: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        stigRequirements.push(stigRequirement);
      } catch (error) {
        errors.push(`Error parsing line ${i + 1}: ${error}`);
      }
    }

    return {
      success: errors.length === 0 || stigRequirements.length > 0,
      imported: stigRequirements.length,
      errors,
      stigRequirements
    };
  };

  const parseCsvLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const updateStigRequirement = (id: string, updates: Partial<StigRequirement>) => {
    const updated = stigRequirements.map(stig =>
      stig.id === id ? { ...stig, ...updates, updatedAt: new Date() } : stig
    );
    onUpdate(updated);
  };

  const deleteStigRequirement = (id: string) => {
    if (confirm('Are you sure you want to delete this STIG requirement?')) {
      onUpdate(stigRequirements.filter(stig => stig.id !== id));
    }
  };

  const filteredStigs = stigRequirements.filter(stig => {
    if (filterSeverity !== 'all' && stig.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && stig.status !== filterStatus) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CAT I': return 'bg-red-100 text-red-800';
      case 'CAT II': return 'bg-yellow-100 text-yellow-800';
      case 'CAT III': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Exception Requested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">STIG Requirements</h2>
          <p className="text-gray-600">Import and manage Security Technical Implementation Guide requirements</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Grid
            </button>
          </div>
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import STIG CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {/* Import Status */}
      {isImporting && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Importing STIG CSV file...</span>
          </div>
        </div>
      )}

      {importResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          importResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`font-medium ${
              importResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              Import {importResult.success ? 'Successful' : 'Failed'}
            </span>
          </div>
          <p className={`text-sm ${
            importResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {importResult.success 
              ? `Successfully imported ${importResult.imported} STIG requirements`
              : `Failed to import STIG requirements`
            }
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-red-700 font-medium">Errors:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {importResult.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li>...and {importResult.errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="CAT I">CAT I (High)</option>
            <option value="CAT II">CAT II (Medium)</option>
            <option value="CAT III">CAT III (Low)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Exception Requested">Exception Requested</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {stigRequirements.filter(s => s.severity === 'CAT I').length}
          </div>
          <div className="text-sm text-red-800">CAT I (High)</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stigRequirements.filter(s => s.severity === 'CAT II').length}
          </div>
          <div className="text-sm text-yellow-800">CAT II (Medium)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stigRequirements.filter(s => s.severity === 'CAT III').length}
          </div>
          <div className="text-sm text-green-800">CAT III (Low)</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stigRequirements.filter(s => s.status === 'Completed').length}
          </div>
          <div className="text-sm text-blue-800">Completed</div>
        </div>
      </div>

      {/* STIG Requirements List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredStigs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No STIG Requirements Found</p>
            <p>Import a STIG CSV file to get started with security requirements.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STIG ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Implementation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStigs.map((stig) => (
                  <tr key={stig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stig.stigId}</div>
                      {stig.vulnId && (
                        <div className="text-sm text-gray-500">{stig.vulnId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{stig.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {stig.description.substring(0, 100)}
                        {stig.description.length > 100 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(stig.severity)}`}>
                        {stig.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={stig.status}
                        onChange={(e) => updateStigRequirement(stig.id, { status: e.target.value as any })}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(stig.status)}`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Exception Requested">Exception Requested</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={stig.implementationStatus}
                        onChange={(e) => updateStigRequirement(stig.id, { implementationStatus: e.target.value as any })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="Open">Open</option>
                        <option value="NotAFinding">Not a Finding</option>
                        <option value="Not_Applicable">Not Applicable</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => deleteStigRequirement(stig.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredStigs.map((stig) => (
              <div key={stig.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{stig.stigId}</h3>
                    {stig.vulnId && <p className="text-sm text-gray-500">{stig.vulnId}</p>}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(stig.severity)}`}>
                    {stig.severity}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">{stig.title}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {stig.description.substring(0, 150)}
                  {stig.description.length > 150 && '...'}
                </p>
                <div className="flex justify-between items-center">
                  <select
                    value={stig.status}
                    onChange={(e) => updateStigRequirement(stig.id, { status: e.target.value as any })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Exception Requested">Exception Requested</option>
                  </select>
                  <button
                    onClick={() => deleteStigRequirement(stig.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}