'use client';

import { useState } from 'react';
import { StigRequirement } from '../types/srtm';
import { STIG_FAMILIES } from '../utils/stigFamilyRecommendations';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

interface StigManagementProps {
  stigRequirements: StigRequirement[];
  onUpdate: (stigRequirements: StigRequirement[]) => void;
}

export default function StigManagement({ stigRequirements, onUpdate }: StigManagementProps) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());


  const clearAllStigs = () => {
    if (window.confirm('Are you sure you want to clear all STIG requirements?')) {
      onUpdate([]);
    }
  };

  // Group loaded requirements by family (using STIG ID or family field)
  const grouped: Record<string, StigRequirement[]> = stigRequirements.reduce((acc, req) => {
    const key = req.family || req.stigRef || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {} as Record<string, StigRequirement[]>);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">STIG Requirements</h2>
        <button
          onClick={clearAllStigs}
          disabled={stigRequirements.length === 0}
          className="px-3 py-1 bg-red-100 text-red-600 rounded disabled:opacity-50"
        >
          <Trash2 className="inline-block mr-1" /> Clear All
        </button>
      </div>
      {stigRequirements.length === 0 && (
        <p className="text-gray-500">No STIG requirements loaded. Please select STIG families first.</p>
      )}
      {Object.entries(grouped).map(([familyKey, reqs]) => {
        const familyMeta = STIG_FAMILIES.find(f => f.stigId === familyKey || f.id === familyKey);
        const title = familyMeta ? familyMeta.name : familyKey;
        const isOpen = expandedFamilies.has(familyKey);
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
              <span className="font-medium">{title} ({reqs.length})</span>
              {isOpen ? <ChevronDown /> : <ChevronRight />}
            </button>
            {isOpen && (
              <ul className="p-4 bg-white list-disc list-inside space-y-2">
                {reqs.map(r => (
                  <li key={r.id}><span className="font-semibold">{r.stigId}</span>: {r.title}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}