'use client';

import { useState } from 'react';
import { StigRequirement } from '../types/srtm';
import { parseStigCsv, storeStigRequirements, getAllStoredStigRequirements, clearStoredStigRequirements } from '../utils/detailedStigRequirements';
import { Upload, Download, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface StigManagementProps {
  stigRequirements: StigRequirement[];
  onUpdate: (stigRequirements: StigRequirement[]) => void;
}

export default function StigManagement({ stigRequirements, onUpdate }: StigManagementProps) {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, familyId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`Uploading ${familyId} STIG...`);

    try {
      const text = await file.text();
      const csvRequirements = parseStigCsv(text, familyId);
      
      if (csvRequirements.length > 0) {
        storeStigRequirements(familyId, csvRequirements);
        const allRequirements = getAllStoredStigRequirements();
        onUpdate(allRequirements);
        setUploadStatus(`✅ Successfully uploaded ${csvRequirements.length} requirements for ${familyId}`);
      } else {
        setUploadStatus(`⚠️ No requirements found in ${familyId} CSV file`);
      }
    } catch (error) {
      setUploadStatus(`❌ Error uploading ${familyId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all STIG requirements?')) {
      clearStoredStigRequirements();
      onUpdate([]);
      setUploadStatus('✅ All STIG requirements cleared');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const stigFamilies = [
    'Access_Control',
    'Audit_and_Accountability', 
    'Configuration_Management',
    'Identification_and_Authentication',
    'System_and_Communications_Protection',
    'System_and_Information_Integrity'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">STIG Management</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {stigRequirements.length} requirements loaded
            </span>
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              disabled={stigRequirements.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className={`mb-4 p-3 rounded-md ${
            uploadStatus.startsWith('✅') ? 'bg-green-50 text-green-800' :
            uploadStatus.startsWith('⚠️') ? 'bg-yellow-50 text-yellow-800' :
            uploadStatus.startsWith('❌') ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {uploadStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stigFamilies.map((family) => {
            const familyCount = stigRequirements.filter(req => req.family === family).length;
            
            return (
              <div key={family} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {family.replace(/_/g, ' ')}
                  </h3>
                  {familyCount > 0 && (
                    <span className="flex items-center space-x-1 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>{familyCount}</span>
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, family)}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                  
                  <p className="text-xs text-gray-500">
                    Upload CSV file exported from STIG Viewer
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to upload STIG requirements:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open STIG Viewer and load the desired STIG</li>
                <li>Go to File → Export → Export Checklist as CSV</li>
                <li>Upload the CSV file using the appropriate family button above</li>
                <li>The system will automatically parse and categorize the requirements</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}