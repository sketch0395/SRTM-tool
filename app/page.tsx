'use client';

import { useState, useEffect } from 'react';
import { SecurityRequirement, SystemDesignElement, TraceabilityLink, SRTMData, WorkflowData } from '../types/srtm';
import { Shield, Plus, Edit2, Trash2, Link, FileText, Settings, CheckSquare, Target, Layers, Download, Upload, RotateCcw } from 'lucide-react';
import RequirementForm from '../components/RequirementForm';
import DesignElementForm from '../components/DesignElementForm';
import TraceabilityMatrix from '../components/TraceabilityMatrix';
import StigManagement from '../components/StigManagement';
import SystemCategorization from '../components/SystemCategorization';
import StigFamilyRecommendations from '../components/StigFamilyRecommendations';
import { convertToStigRequirements, fetchAndConvertStigRequirementsToMatrix } from '../utils/detailedStigRequirements';
import { NIST_CONTROL_BASELINES } from '../utils/nistBaselines';

export default function Home() {
  // Track CSV fetch failures for STIG families
  const [loadCsvFailures, setLoadCsvFailures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('design');
  const [data, setData] = useState<SRTMData>({
    requirements: [],
    designElements: [],
    traceabilityLinks: [],
    stigRequirements: [],
    systemCategorizations: []
  });

  // Initialize with empty data
  useEffect(() => {
    const initialData: SRTMData = {
      requirements: [],
      designElements: [],
      traceabilityLinks: [],
      stigRequirements: [],
      systemCategorizations: []
    };
    setData(initialData);
  }, []);

  const tabs = [
    { id: 'design', name: 'Design Elements', icon: Settings },
    { id: 'categorization', name: 'NIST 800-60 Categorization', icon: Layers },
    { id: 'requirements', name: 'NIST 800-53 Requirements', icon: FileText },
    { id: 'stig-families', name: 'STIG Recommendations', icon: Target },
    { id: 'stig', name: 'STIG Requirements', icon: CheckSquare },
    { id: 'matrix', name: 'Traceability Matrix', icon: Link },
  ];

  const updateData = (newData: Partial<SRTMData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleGenerateRequirements = (newRequirements: SecurityRequirement[]) => {
    setData(prev => ({ 
      ...prev, 
      requirements: [...prev.requirements, ...newRequirements] 
    }));
    // Switch to requirements tab to show the generated requirements
    setActiveTab('requirements');
  };

  const handleLoadStigFamilies = (selectedStigFamilyIds: string[]) => {
    // Automatically fetch and convert STIG CSV from stigviewer.com
    (async () => {
      // Fetch and convert STIG CSVs to traceability matrix format
      const newStigRequirements = await fetchAndConvertStigRequirementsToMatrix(selectedStigFamilyIds);
      // Compute failures where no requirements returned
      const loadedFamilies = new Set(newStigRequirements.map(req => req.family || ''));
      const failures = selectedStigFamilyIds.filter(id => !loadedFamilies.has(id));
      setLoadCsvFailures(failures);

      setData(prev => ({
        ...prev,
        stigRequirements: [...prev.stigRequirements, ...newStigRequirements]
      }));

      // Switch to STIG requirements tab to show loaded families
      setActiveTab('stig');
    })();
  };

  const handleSaveWorkflow = () => {
    // Prompt user for workflow name
    const workflowName = window.prompt(
      'Enter a name for this workflow:',
      'my-workflow'
    );
    
    // If user cancels, don't save
    if (!workflowName) return;
    
    // Sanitize filename (remove invalid characters)
    const sanitizedName = workflowName.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    
    const workflowData: WorkflowData = {
      systemCategorizations: data.systemCategorizations,
      designElements: data.designElements,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizedName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflowData: WorkflowData = JSON.parse(e.target?.result as string);
        
        // Auto-generate requirements from categorizations if they exist
        let generatedRequirements: SecurityRequirement[] = [];
        if (workflowData.systemCategorizations && workflowData.systemCategorizations.length > 0) {
          workflowData.systemCategorizations.forEach(categorization => {
            const highestImpact = getHighestOverallImpact(categorization.overallCategorization);
            const controlIds = NIST_CONTROL_BASELINES[highestImpact] || NIST_CONTROL_BASELINES.Low;
            
            const requirements: SecurityRequirement[] = controlIds.map((controlId: string) => ({
              id: `${categorization.id}-${controlId}-${Date.now()}`,
              title: `${controlId} - Security Control`,
              description: `Implementation of NIST SP 800-53 control ${controlId}`,
              source: `NIST SP 800-53 (${highestImpact} Baseline)`,
              category: getControlCategory(controlId.split('-')[0]),
              priority: 'Medium' as const,
              status: 'Draft' as const,
              nistFunction: 'Protect' as const,
              rmfStep: 'Select' as const,
              controlFamily: controlId.split('-')[0],
              controlIdentifier: controlId,
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            generatedRequirements = [...generatedRequirements, ...requirements];
          });
        }
        
        // Update the data with uploaded workflow and generated requirements
        setData(prev => ({
          ...prev,
          systemCategorizations: workflowData.systemCategorizations,
          designElements: workflowData.designElements,
          requirements: generatedRequirements
        }));

        // Follow the correct workflow: Design > Categorization > Requirements
        if (workflowData.designElements.length > 0) {
          if (workflowData.systemCategorizations.length > 0) {
            setActiveTab('requirements');
          } else {
            setActiveTab('categorization');
          }
        } else {
          setActiveTab('design');
        }

        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Error parsing workflow file:', error);
        alert('Error parsing workflow file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Helper function to determine highest impact level
  const getHighestOverallImpact = (categorization: { confidentiality: string; integrity: string; availability: string }) => {
    const impacts = [categorization.confidentiality, categorization.integrity, categorization.availability];
    if (impacts.includes('High')) return 'High';
    if (impacts.includes('Moderate')) return 'Moderate';
    return 'Low';
  };

  // Helper function to map control family to category
  const getControlCategory = (family: string): SecurityRequirement['category'] => {
    const familyMap: { [key: string]: SecurityRequirement['category'] } = {
      'AC': 'Access Control',
      'AT': 'Authentication',
      'AU': 'Audit',
      'CA': 'Authorization',
      'CM': 'System Integrity',
      'CP': 'Incident Response',
      'IA': 'Authentication',
      'IR': 'Incident Response',
      'MA': 'System Integrity',
      'MP': 'Data Protection',
      'PE': 'Access Control',
      'PL': 'System Integrity',
      'PS': 'Access Control',
      'RA': 'System Integrity',
      'SA': 'System Integrity',
      'SC': 'Network Security',
      'SI': 'System Integrity'
    };
    return familyMap[family] || 'Other';
  };

  const handleClearWorkflow = () => {
    if (window.confirm('Are you sure you want to clear all workflow data? This action cannot be undone.')) {
      // Reset all data to initial state
      const initialData: SRTMData = {
        requirements: [],
        designElements: [],
        traceabilityLinks: [],
        stigRequirements: [],
        systemCategorizations: []
      };
      setData(initialData);
      
      // Go back to design tab
      setActiveTab('design');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Security Requirements Traceability Matrix
                </h1>
                <p className="text-sm text-gray-600">NIST Framework • RMF • STIG Compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveWorkflow}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Save Workflow
              </button>
              <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Workflow
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadWorkflow}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClearWorkflow}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Workflow
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-8 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            // Determine if tab should be disabled based on workflow
            let isDisabled = false;
            let disabledReason = '';
            
            if (tab.id === 'categorization' && data.designElements.length === 0) {
              isDisabled = true;
              disabledReason = 'Complete Design Elements first';
            } else if (tab.id === 'requirements' && (data.designElements.length === 0 || data.systemCategorizations.length === 0)) {
              isDisabled = true;
              disabledReason = 'Complete Design Elements and System Categorization first';
            }

            return (
              <div key={tab.id} className="relative">
                <button
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isDisabled ? disabledReason : ''}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
                {isDisabled && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    {disabledReason}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        {activeTab === 'stig' && loadCsvFailures.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            Warning: No CSV data returned for the following STIG families: {loadCsvFailures.join(', ')}.
          </div>
        )}

        {activeTab === 'design' && (
          <DesignElementForm 
            designElements={data.designElements}
            onUpdate={(designElements) => updateData({ designElements })}
            onNavigateToNext={() => setActiveTab('categorization')}
          />
        )}
        {activeTab === 'categorization' && (
          <SystemCategorization 
            systemCategorizations={data.systemCategorizations}
            onUpdate={(systemCategorizations) => updateData({ systemCategorizations })}
            onGenerateRequirements={handleGenerateRequirements}
            onNavigateToNext={() => setActiveTab('requirements')}
          />
        )}
        {activeTab === 'requirements' && (
          <RequirementForm 
            requirements={data.requirements}
            onUpdate={(requirements) => updateData({ requirements })}
          />
        )}
        {activeTab === 'stig' && (
          <StigManagement
            stigRequirements={data.stigRequirements}
            onUpdate={(stigRequirements) => updateData({ stigRequirements })}
          />
        )}
        {activeTab === 'stig-families' && (
          <StigFamilyRecommendations 
            requirements={data.requirements}
            designElements={data.designElements}
            onLoadStigFamilies={handleLoadStigFamilies}
          />
        )}
        {activeTab === 'matrix' && <TraceabilityMatrix data={data} onUpdate={updateData} />}
      </div>
    </div>
  );
}