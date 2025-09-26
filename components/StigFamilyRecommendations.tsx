'use client';

import { useState, useEffect } from 'react';
import { SecurityRequirement, SystemDesignElement } from '../types/srtm';
import { getStigFamilyRecommendations, getImplementationEffort, StigFamilyRecommendation } from '../utils/stigFamilyRecommendations';
import { Shield, Target, Clock, AlertTriangle, CheckCircle, Info, ExternalLink, Zap, BarChart3 } from 'lucide-react';

interface StigRecommendationProps {
  requirements: SecurityRequirement[];
  designElements: SystemDesignElement[];
}

export default function StigFamilyRecommendations({ requirements, designElements }: StigRecommendationProps) {
  const [recommendations, setRecommendations] = useState<StigFamilyRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StigFamilyRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (requirements.length > 0 || designElements.length > 0) {
      const recs = getStigFamilyRecommendations(requirements, designElements);
      setRecommendations(recs);
    }
  }, [requirements, designElements]);

  const effort = getImplementationEffort(recommendations);

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
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Estimated Effort</div>
            <div className="text-lg font-semibold text-blue-600">{effort.estimatedDays} days</div>
          </div>
        </div>
      </div>

      {/* Implementation Effort Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-900">Implementation Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-sm text-blue-800">Recommended STIGs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{effort.totalRequirements}</div>
            <div className="text-sm text-blue-800">Total Requirements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{effort.estimatedHours}</div>
            <div className="text-sm text-blue-800">Estimated Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{effort.priorityCounts.critical + effort.priorityCounts.high}</div>
            <div className="text-sm text-blue-800">High Priority STIGs</div>
          </div>
        </div>
        
        {/* Priority Distribution */}
        <div className="mt-4">
          <div className="text-sm font-medium text-blue-900 mb-2">Priority Distribution</div>
          <div className="flex space-x-4 text-xs">
            {effort.priorityCounts.critical > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                Critical: {effort.priorityCounts.critical}
              </span>
            )}
            {effort.priorityCounts.high > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                High: {effort.priorityCounts.high}
              </span>
            )}
            {effort.priorityCounts.medium > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Medium: {effort.priorityCounts.medium}
              </span>
            )}
            {effort.priorityCounts.low > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Low: {effort.priorityCounts.low}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.stigFamily.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{recommendation.stigFamily.name}</h3>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.implementationPriority)}`}>
                    <span className="flex items-center">
                      {getPriorityIcon(recommendation.implementationPriority)}
                      <span className="ml-1">{recommendation.implementationPriority}</span>
                    </span>
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{recommendation.stigFamily.description}</p>
                
                {/* Relevance Score and Match Info */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Relevance: {recommendation.relevanceScore.toFixed(1)}
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {recommendation.matchingRequirements.length} Req Matches
                  </span>
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    {recommendation.matchingDesignElements.length} Design Matches
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    ~{recommendation.stigFamily.estimatedRequirements} Requirements
                  </span>
                </div>

                {/* System Types */}
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Applicable System Types: </span>
                  <span className="text-sm text-gray-600">{recommendation.stigFamily.applicableSystemTypes.join(', ')}</span>
                </div>

                {/* Control Families */}
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Control Families: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {recommendation.stigFamily.controlFamilies.map(family => (
                      <span key={family} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {family}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <button
                  onClick={() => {
                    setSelectedRecommendation(recommendation);
                    setShowDetails(true);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Quick Reasoning Preview */}
            {recommendation.reasoning.length > 0 && (
              <div className="bg-gray-50 rounded p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Why this STIG is recommended:</div>
                <div className="text-sm text-gray-600">
                  {recommendation.reasoning.slice(0, 2).join('; ')}
                  {recommendation.reasoning.length > 2 && '...'}
                </div>
              </div>
            )}
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No STIG recommendations found</p>
            <p className="text-sm">Try adding more specific requirements or design elements that mention technologies, platforms, or system types.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedRecommendation.stigFamily.name}</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ExternalLink className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedRecommendation.stigFamily.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Relevance Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Relevance Score:</span>
                      <span className="font-medium">{selectedRecommendation.relevanceScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Implementation Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedRecommendation.implementationPriority)}`}>
                        {selectedRecommendation.implementationPriority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Requirements:</span>
                      <span className="font-medium">{selectedRecommendation.stigFamily.estimatedRequirements}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Match Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Matching Requirements:</span>
                      <span className="font-medium">{selectedRecommendation.matchingRequirements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Matching Design Elements:</span>
                      <span className="font-medium">{selectedRecommendation.matchingDesignElements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Control Families:</span>
                      <span className="font-medium">{selectedRecommendation.stigFamily.controlFamilies.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reasoning</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {selectedRecommendation.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Applicable System Types</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendation.stigFamily.applicableSystemTypes.map(type => (
                    <span key={type} className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}