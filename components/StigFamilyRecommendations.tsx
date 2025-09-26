'use client';

import { useState, useEffect } from 'react';
import { SecurityRequirement, SystemDesignElement } from '../types/srtm';
import { getStigFamilyRecommendations, getImplementationEffort, StigFamilyRecommendation } from '../utils/stigFamilyRecommendations';
import { stigRequirementsDatabase } from '../utils/detailedStigRequirements';
import { Shield, Target, Clock, AlertTriangle, CheckCircle, Info, Download, CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';

interface StigRecommendationProps {
  requirements: SecurityRequirement[];
  designElements: SystemDesignElement[];
  onLoadStigFamilies: (selectedIds: string[]) => void;
}

export default function StigFamilyRecommendations({ requirements, designElements, onLoadStigFamilies }: StigRecommendationProps) {
  const [recommendations, setRecommendations] = useState<StigFamilyRecommendation[]>([]);
  const [selectedStigIds, setSelectedStigIds] = useState<Set<string>>(new Set());
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (requirements.length > 0 || designElements.length > 0) {
      const recs = getStigFamilyRecommendations(requirements, designElements);
      setRecommendations(recs);
    }
  }, [requirements, designElements]);

  const handleStigToggle = (stigId: string) => {
    setSelectedStigIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stigId)) {
        newSet.delete(stigId);
      } else {
        newSet.add(stigId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedStigIds(new Set(recommendations.map(rec => rec.stigFamily.id)));
  };

  const handleSelectNone = () => {
    setSelectedStigIds(new Set());
  };

  const handleLoadSelected = () => {
    if (selectedStigIds.size > 0) {
      onLoadStigFamilies(Array.from(selectedStigIds));
    }
  };

  const toggleAccordion = (stigId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card selection when clicking accordion
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stigId)) {
        newSet.delete(stigId);
      } else {
        newSet.add(stigId);
      }
      return newSet;
    });
  };

  const getRequirementCount = (stigId: string): number => {
    const requirements = stigRequirementsDatabase[stigId];
    return requirements ? requirements.length : 0;
  };

  const getTotalSelectedRequirements = (): number => {
    return Array.from(selectedStigIds).reduce((total, stigId) => {
      return total + getRequirementCount(stigId);
    }, 0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return <AlertTriangle className="h-4 w-4" />;
      case 'High': return <Target className="h-4 w-4" />;
      case 'Medium': return <Info className="h-4 w-4" />;
      case 'Low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (requirements.length === 0 && designElements.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No Analysis Data Available</p>
          <p>Add security requirements and design elements to get STIG family recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">STIG Family Recommendations</h2>
          <p className="text-gray-600">Based on {requirements.length} requirements and {designElements.length} design elements</p>
        </div>
      </div>

      {/* Selection Summary and Actions */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    {selectedStigIds.size} of {recommendations.length} STIG families selected
                  </div>
                  <div className="text-sm text-blue-700">
                    {getTotalSelectedRequirements()} detailed requirements ready to load
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            {selectedStigIds.size > 0 && (
              <button
                onClick={handleLoadSelected}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Load {selectedStigIds.size} STIG Families ({getTotalSelectedRequirements()} Requirements)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">
              <strong>How to use:</strong> Click on the STIG families below to select them for your project. 
              Selected families will be highlighted and added to your requirements when you click "Load STIG Families".
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => {
          const isSelected = selectedStigIds.has(recommendation.stigFamily.id);
          const requirementCount = getRequirementCount(recommendation.stigFamily.id);
          
          return (
            <div
              key={recommendation.stigFamily.id}
              onClick={() => handleStigToggle(recommendation.stigFamily.id)}
              className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckSquare className="h-3 w-3 text-white" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.stigFamily.name}
                    </h3>
                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.implementationPriority)}`}>
                      <span className="flex items-center">
                        {getPriorityIcon(recommendation.implementationPriority)}
                        <span className="ml-1">{recommendation.implementationPriority}</span>
                      </span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{recommendation.stigFamily.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Requirements</div>
                      <div className="text-lg font-semibold text-gray-900">{requirementCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Relevance Score</div>
                      <div className="text-lg font-semibold text-gray-900">{recommendation.relevanceScore}/10</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Est. Effort</div>
                      <div className="text-lg font-semibold text-gray-900">{Math.ceil(requirementCount * 0.5)} days</div>
                    </div>
                  </div>

                  {recommendation.reasoning.length > 0 && (
                    <div className="border-t pt-4">
                      <button
                        onClick={(e) => toggleAccordion(recommendation.stigFamily.id, e)}
                        className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded p-2 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-gray-900">
                          Why this STIG is recommended ({recommendation.reasoning.length} reasons)
                        </h4>
                        {expandedAccordions.has(recommendation.stigFamily.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedAccordions.has(recommendation.stigFamily.id) && (
                        <div className="mt-2 pl-2">
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {recommendation.reasoning.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStigIds.size > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-green-900">
                  Ready to load {selectedStigIds.size} STIG families
                </div>
                <div className="text-sm text-green-700">
                  This will add {getTotalSelectedRequirements()} detailed security requirements to your project
                </div>
              </div>
            </div>
            <button
              onClick={handleLoadSelected}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Load Requirements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}