'use client';

import { useState, useEffect } from 'react';
import { SecurityRequirement, SystemDesignElement, TestCase, TraceabilityLink, SRTMData } from '../types/srtm';
import { Shield, Plus, Edit2, Trash2, Link, FileText, Settings, TestTube, CheckSquare, Target, Layers } from 'lucide-react';
import RequirementForm from '../components/RequirementForm';
import DesignElementForm from '../components/DesignElementForm';
import TestCaseForm from '../components/TestCaseForm';
import TraceabilityMatrix from '../components/TraceabilityMatrix';
import Dashboard from '../components/Dashboard';
import StigManagement from '../components/StigManagement';
import SystemCategorization from '../components/SystemCategorization';
import StigFamilyRecommendations from '../components/StigFamilyRecommendations';
import { convertToStigRequirements } from '../utils/detailedStigRequirements';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<SRTMData>({
    requirements: [],
    designElements: [],
    testCases: [],
    traceabilityLinks: [],
    stigRequirements: [],
    systemCategorizations: []
  });

  // Initialize with empty data
  useEffect(() => {
    const initialData: SRTMData = {
      requirements: [],
      designElements: [],
      testCases: [],
      traceabilityLinks: [],
      stigRequirements: [],
      systemCategorizations: []
    };
    setData(initialData);
  }, []);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Shield },
    { id: 'categorization', name: 'System Categorization', icon: Layers },
    { id: 'requirements', name: 'Requirements', icon: FileText },
    { id: 'design', name: 'Design Elements', icon: Settings },
    { id: 'tests', name: 'Test Cases', icon: TestTube },
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
    // Convert selected STIG families to detailed STIG requirements
    const newStigRequirements = convertToStigRequirements(selectedStigFamilyIds);

    setData(prev => ({
      ...prev,
      stigRequirements: [...prev.stigRequirements, ...newStigRequirements]
    }));

    // Switch to STIG requirements tab to show loaded families
    setActiveTab('stig');
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-8 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'categorization' && (
            <SystemCategorization 
              systemCategorizations={data.systemCategorizations}
              onUpdate={(systemCategorizations) => updateData({ systemCategorizations })}
              onGenerateRequirements={handleGenerateRequirements}
            />
          )}
          {activeTab === 'requirements' && (
            <RequirementForm 
              requirements={data.requirements}
              onUpdate={(requirements) => updateData({ requirements })}
            />
          )}
          {activeTab === 'design' && (
            <DesignElementForm 
              designElements={data.designElements}
              onUpdate={(designElements) => updateData({ designElements })}
            />
          )}
          {activeTab === 'tests' && (
            <TestCaseForm 
              testCases={data.testCases}
              onUpdate={(testCases) => updateData({ testCases })}
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
    </div>
  );
}