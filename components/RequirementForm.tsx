'use client';

import { useState } from 'react';
import { SecurityRequirement } from '../types/srtm';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { CONTROL_FAMILY_NAMES } from '../utils/nistBaselines';

interface RequirementFormProps {
  requirements: SecurityRequirement[];
  onUpdate: (requirements: SecurityRequirement[]) => void;
}

export default function RequirementForm({ requirements, onUpdate }: RequirementFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<SecurityRequirement>>({
    title: '',
    description: '',
    source: '',
    category: 'Authentication',
    priority: 'Medium',
    status: 'Draft',
    nistFunction: undefined,
    nistSubcategory: '',
    rmfStep: undefined,
    controlFamily: '',
    controlIdentifier: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing requirement
      const updated = requirements.map(req => 
        req.id === editingId 
          ? { ...req, ...formData, updatedAt: new Date() }
          : req
      );
      onUpdate(updated);
    } else {
      // Add new requirement
      const newRequirement: SecurityRequirement = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description!,
        source: formData.source!,
        category: formData.category!,
        priority: formData.priority!,
        status: formData.status!,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onUpdate([...requirements, newRequirement]);
    }

    resetForm();
  };

  const handleEdit = (requirement: SecurityRequirement) => {
    setFormData(requirement);
    setEditingId(requirement.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this requirement?')) {
      onUpdate(requirements.filter(req => req.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      source: '',
      category: 'Authentication',
      priority: 'Medium',
      status: 'Draft',
      nistFunction: undefined,
      nistSubcategory: '',
      rmfStep: undefined,
      controlFamily: '',
      controlIdentifier: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  // Group requirements by control family
  const groupedRequirements = requirements.reduce((acc, req) => {
    const family = req.controlFamily || 'Other';
    if (!acc[family]) {
      acc[family] = [];
    }
    acc[family].push(req);
    return acc;
  }, {} as Record<string, SecurityRequirement[]>);

  // Sort families alphabetically
  const sortedFamilies = Object.keys(groupedRequirements).sort();

  // Toggle accordion for a family
  const toggleFamily = (family: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(family)) {
      newExpanded.delete(family);
    } else {
      newExpanded.add(family);
    }
    setExpandedFamilies(newExpanded);
  };

  // Expand all families
  const expandAll = () => {
    setExpandedFamilies(new Set(sortedFamilies));
  };

  // Collapse all families
  const collapseAll = () => {
    setExpandedFamilies(new Set());
  };

  // Get full family name - using validated NIST SP 800-53 Rev 5 names
  const getFullFamilyName = (familyCode: string): string => {
    return CONTROL_FAMILY_NAMES[familyCode] || familyCode;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NIST 800-53 Security Requirements</h2>
          <p className="text-gray-600">Define security controls based on system categorization</p>
          <div className="mt-2 text-sm text-blue-600">
            <strong>Step 3:</strong> Generate security requirements based on your system categorization and design elements
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </button>
      </div>

      {/* Workflow Progress */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-600 font-medium">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2">✓</div>
              Design Elements
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center text-green-600 font-medium">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2">✓</div>
              NIST 800-60 Categorization
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center text-blue-600 font-medium">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">3</div>
              NIST 800-53 Requirements
            </div>
          </div>
          {requirements.length > 0 && (
            <div className="text-sm text-green-600 font-medium">
              ✓ {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} defined
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Requirement' : 'Add New Requirement'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., NIST, ISO 27001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || 'Authentication'}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Authentication">Authentication</option>
                    <option value="Authorization">Authorization</option>
                    <option value="Encryption">Encryption</option>
                    <option value="Audit">Audit</option>
                    <option value="Input Validation">Input Validation</option>
                    <option value="Access Control">Access Control</option>
                    <option value="Data Protection">Data Protection</option>
                    <option value="Network Security">Network Security</option>
                    <option value="System Integrity">System Integrity</option>
                    <option value="Incident Response">Incident Response</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* NIST and RMF Fields */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">NIST Framework & RMF Mapping</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIST CSF Function
                    </label>
                    <select
                      value={formData.nistFunction || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nistFunction: e.target.value as any || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select NIST Function</option>
                      <option value="Identify">Identify (ID)</option>
                      <option value="Protect">Protect (PR)</option>
                      <option value="Detect">Detect (DE)</option>
                      <option value="Respond">Respond (RS)</option>
                      <option value="Recover">Recover (RC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RMF Step
                    </label>
                    <select
                      value={formData.rmfStep || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rmfStep: e.target.value as any || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select RMF Step</option>
                      <option value="Categorize">1. Categorize</option>
                      <option value="Select">2. Select</option>
                      <option value="Implement">3. Implement</option>
                      <option value="Assess">4. Assess</option>
                      <option value="Authorize">5. Authorize</option>
                      <option value="Monitor">6. Monitor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Control Family
                    </label>
                    <select
                      value={formData.controlFamily || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, controlFamily: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Control Family</option>
                      <option value="AC">AC - Access Control</option>
                      <option value="AT">AT - Awareness and Training</option>
                      <option value="AU">AU - Audit and Accountability</option>
                      <option value="CA">CA - Security Assessment and Authorization</option>
                      <option value="CM">CM - Configuration Management</option>
                      <option value="CP">CP - Contingency Planning</option>
                      <option value="IA">IA - Identification and Authentication</option>
                      <option value="IR">IR - Incident Response</option>
                      <option value="MA">MA - Maintenance</option>
                      <option value="MP">MP - Media Protection</option>
                      <option value="PE">PE - Physical and Environmental Protection</option>
                      <option value="PL">PL - Planning</option>
                      <option value="PS">PS - Personnel Security</option>
                      <option value="RA">RA - Risk Assessment</option>
                      <option value="SA">SA - System and Services Acquisition</option>
                      <option value="SC">SC - System and Communications Protection</option>
                      <option value="SI">SI - System and Information Integrity</option>
                      <option value="SR">SR - Supply Chain Risk Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Control Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.controlIdentifier || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, controlIdentifier: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., AC-2, AU-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIST Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.nistSubcategory || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nistSubcategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., ID.AM-1, PR.AC-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'Medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Implemented">Implemented</option>
                    <option value="Tested">Tested</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="space-y-4">
        {requirements.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-2">No Security Requirements</p>
            <p className="text-gray-500">Click "Add Requirement" to get started or generate them from system categorization.</p>
          </div>
        ) : (
          <>
            {/* Expand/Collapse All Controls */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
              <div className="text-sm text-gray-700">
                <strong>{requirements.length}</strong> requirement{requirements.length !== 1 ? 's' : ''} across <strong>{sortedFamilies.length}</strong> control famil{sortedFamilies.length !== 1 ? 'ies' : 'y'}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={expandAll}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Control Family Accordions */}
            {sortedFamilies.map((family) => {
              const familyRequirements = groupedRequirements[family];
              const isExpanded = expandedFamilies.has(family);
              
              return (
                <div key={family} className="bg-white rounded-lg border overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleFamily(family)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {family} - {getFullFamilyName(family)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {familyRequirements.length} control{familyRequirements.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Priority badges */}
                      {['High', 'Medium', 'Low'].map(priority => {
                        const count = familyRequirements.filter(r => r.priority === priority).length;
                        if (count === 0) return null;
                        return (
                          <span
                            key={priority}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              priority === 'High' ? 'bg-red-100 text-red-800' :
                              priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {count} {priority}
                          </span>
                        );
                      })}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {familyRequirements.map((requirement) => (
                        <div key={requirement.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {/* Control Header */}
                              <div className="flex items-start space-x-3 mb-2">
                                {requirement.controlIdentifier && (
                                  <span className="inline-flex px-2 py-1 text-sm font-semibold bg-blue-600 text-white rounded">
                                    {requirement.controlIdentifier}
                                  </span>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {requirement.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {requirement.description}
                                  </p>
                                </div>
                              </div>

                              {/* Control Metadata */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  requirement.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {requirement.priority} Priority
                                </span>
                                
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  requirement.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                  requirement.status === 'Implemented' ? 'bg-blue-100 text-blue-800' :
                                  requirement.status === 'Tested' ? 'bg-purple-100 text-purple-800' :
                                  requirement.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {requirement.status}
                                </span>

                                {requirement.category && (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {requirement.category}
                                  </span>
                                )}

                                {requirement.nistFunction && (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    NIST: {requirement.nistFunction}
                                  </span>
                                )}

                                {requirement.rmfStep && (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                    RMF: {requirement.rmfStep}
                                  </span>
                                )}

                                {requirement.source && (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    {requirement.source}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(requirement)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(requirement.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}