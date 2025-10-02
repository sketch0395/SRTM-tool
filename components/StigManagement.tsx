'use client';

import { useState } from 'react';
import { StigRequirement, GroupedStigRequirement } from '../types/srtm';
import { STIG_FAMILIES } from '../utils/stigFamilyRecommendations';
import { groupStigRequirementsByTitle } from '../utils/detailedStigRequirements';
import { ChevronDown, ChevronRight, Trash2, Hash, Eye, EyeOff } from 'lucide-react';

interface StigManagementProps {
  stigRequirements: StigRequirement[];
  onUpdate: (stigRequirements: StigRequirement[]) => void;
}

export default function StigManagement({ stigRequirements, onUpdate }: StigManagementProps) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());
  const [showIndividualRequirements, setShowIndividualRequirements] = useState<Set<string>>(new Set());

  const clearAllStigs = () => {
    if (window.confirm('Are you sure you want to clear all STIG requirements?')) {
      onUpdate([]);
    }
  };

  // Group loaded requirements by family (using STIG ID or family field)
  const familyGrouped: Record<string, StigRequirement[]> = stigRequirements.reduce((acc, req) => {
    const key = req.family || req.stigRef || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {} as Record<string, StigRequirement[]>);

  // Group requirements by title within each family
  const familyGroupedByTitle: Record<string, GroupedStigRequirement[]> = {};
  Object.entries(familyGrouped).forEach(([familyKey, reqs]) => {
    familyGroupedByTitle[familyKey] = groupStigRequirementsByTitle(reqs);
  });

  const toggleRequirementDetail = (requirementKey: string) => {
    setExpandedRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementKey)) {
        newSet.delete(requirementKey);
      } else {
        newSet.add(requirementKey);
      }
      return newSet;
    });
  };

  const toggleIndividualRequirements = (requirementKey: string) => {
    setShowIndividualRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementKey)) {
        newSet.delete(requirementKey);
      } else {
        newSet.add(requirementKey);
      }
      return newSet;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CAT I': return 'bg-red-100 text-red-800 border-red-200';
      case 'CAT II': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CAT III': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const totalUniqueRequirements = Object.values(familyGroupedByTitle).reduce(
    (total, grouped) => total + grouped.length, 0
  );
  const totalIndividualRequirements = stigRequirements.length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">STIG Requirements</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalUniqueRequirements} unique requirements ({totalIndividualRequirements} total instances)
          </p>
        </div>
        <button
          onClick={clearAllStigs}
          disabled={stigRequirements.length === 0}
          className="px-3 py-1 bg-red-100 text-red-600 rounded disabled:opacity-50 hover:bg-red-200 transition-colors"
        >
          <Trash2 className="inline-block mr-1 h-4 w-4" /> Clear All
        </button>
      </div>
      
      {stigRequirements.length === 0 && (
        <p className="text-gray-500">No STIG requirements loaded. Please select STIG families first.</p>
      )}
      
      {Object.entries(familyGroupedByTitle).map(([familyKey, groupedReqs]) => {
        const familyMeta = STIG_FAMILIES.find(f => f.stigId === familyKey || f.id === familyKey);
        const title = familyMeta ? familyMeta.name : familyKey;
        const isOpen = expandedFamilies.has(familyKey);
        const totalIndividualInFamily = familyGrouped[familyKey]?.length || 0;
        
        return (
          <div key={familyKey} className="border rounded-lg">
            <button
              onClick={() => {
                const set = new Set(expandedFamilies);
                set.has(familyKey) ? set.delete(familyKey) : set.add(familyKey);
                setExpandedFamilies(set);
              }}
              className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{title}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {groupedReqs.length} unique
                </span>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                  {totalIndividualInFamily} total
                </span>
              </div>
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            
            {isOpen && (
              <div className="bg-white">
                {groupedReqs.map((groupedReq, index) => {
                  const requirementKey = `${familyKey}-${index}`;
                  const isReqExpanded = expandedRequirements.has(requirementKey);
                  const showIndividual = showIndividualRequirements.has(requirementKey);
                  
                  return (
                    <div key={requirementKey} className="border-t border-gray-200">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(groupedReq.severity)}`}>
                                {groupedReq.severity}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(groupedReq.status)}`}>
                                {groupedReq.status}
                              </span>
                              {groupedReq.count > 1 && (
                                <span className="flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                                  <Hash className="h-3 w-3 mr-1" />
                                  {groupedReq.count}
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{groupedReq.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{groupedReq.description}</p>
                            
                            {groupedReq.count > 1 && (
                              <div className="text-xs text-gray-500">
                                STIG IDs: {groupedReq.stigIds.slice(0, 3).join(', ')}
                                {groupedReq.stigIds.length > 3 && ` +${groupedReq.stigIds.length - 3} more`}
                              </div>
                            )}
                            {groupedReq.count === 1 && (
                              <div className="text-xs text-gray-500">
                                STIG ID: {groupedReq.stigIds[0]}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {groupedReq.count > 1 && (
                              <button
                                onClick={() => toggleIndividualRequirements(requirementKey)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title={showIndividual ? "Hide individual requirements" : "Show individual requirements"}
                              >
                                {showIndividual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => toggleRequirementDetail(requirementKey)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isReqExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        {isReqExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Check Procedure</h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded">{groupedReq.checkText}</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2">Fix Text</h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded">{groupedReq.fixText}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {showIndividual && groupedReq.count > 1 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h5 className="font-medium text-gray-900 mb-3">Individual Requirements ({groupedReq.count})</h5>
                            <div className="space-y-2">
                              {groupedReq.requirements.map((req, reqIndex) => (
                                <div key={req.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-gray-600">{req.stigId}</span>
                                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(req.status)}`}>
                                      {req.status}
                                    </span>
                                  </div>
                                  <span className="text-gray-500">{req.family}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}