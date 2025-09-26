'use client';

import { useState } from 'react';
import { SRTMData, TraceabilityLink } from '../types/srtm';
import { Plus, Edit2, Trash2, Save, X, Link2, Eye, EyeOff } from 'lucide-react';

interface TraceabilityMatrixProps {
  data: SRTMData;
  onUpdate: (data: Partial<SRTMData>) => void;
}

export default function TraceabilityMatrix({ data, onUpdate }: TraceabilityMatrixProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [formData, setFormData] = useState<Partial<TraceabilityLink>>({
    requirementId: '',
    designElementId: '',
    testCaseId: '',
    linkType: 'Requirement-Design',
    status: 'Active',
    rationale: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = data.traceabilityLinks.map(link => 
        link.id === editingId 
          ? { ...link, ...formData, updatedAt: new Date() }
          : link
      );
      onUpdate({ traceabilityLinks: updated });
    } else {
      const newLink: TraceabilityLink = {
        id: Date.now().toString(),
        requirementId: formData.requirementId!,
        designElementId: formData.designElementId,
        testCaseId: formData.testCaseId,
        linkType: formData.linkType!,
        status: formData.status!,
        rationale: formData.rationale,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onUpdate({ traceabilityLinks: [...data.traceabilityLinks, newLink] });
    }

    resetForm();
  };

  const handleEdit = (link: TraceabilityLink) => {
    setFormData(link);
    setEditingId(link.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this traceability link?')) {
      onUpdate({
        traceabilityLinks: data.traceabilityLinks.filter(link => link.id !== id)
      });
    }
  };

  const resetForm = () => {
    setFormData({
      requirementId: '',
      designElementId: '',
      testCaseId: '',
      linkType: 'Requirement-Design',
      status: 'Active',
      rationale: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const getLinkedElements = (requirementId: string) => {
    const links = data.traceabilityLinks.filter(link => 
      link.requirementId === requirementId && link.status === 'Active'
    );
    
    return {
      designElements: links
        .filter(link => link.designElementId)
        .map(link => data.designElements.find(elem => elem.id === link.designElementId))
        .filter(Boolean),
      testCases: links
        .filter(link => link.testCaseId)
        .map(link => data.testCases.find(test => test.id === link.testCaseId))
        .filter(Boolean)
    };
  };

  const MatrixView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Security Requirement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Design Elements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Cases
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.requirements.map((requirement) => {
              const linked = getLinkedElements(requirement.id);
              const hasCoverage = linked.designElements.length > 0 || linked.testCases.length > 0;
              
              return (
                <tr key={requirement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {requirement.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {requirement.category} • {requirement.priority} Priority
                      </div>
                      <div className={`text-xs px-2 py-1 mt-2 rounded-full inline-block ${
                        requirement.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        requirement.status === 'Implemented' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {requirement.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {linked.designElements.map((element: any) => (
                        <div key={element.id} className="text-sm">
                          <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {element.name}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {element.type}
                          </div>
                        </div>
                      ))}
                      {linked.designElements.length === 0 && (
                        <span className="text-xs text-gray-400">No design elements linked</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {linked.testCases.map((testCase: any) => (
                        <div key={testCase.id} className="text-sm">
                          <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {testCase.title}
                          </span>
                          <div className={`text-xs mt-1 ${
                            testCase.status === 'Passed' ? 'text-green-600' :
                            testCase.status === 'Failed' ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {testCase.status}
                          </div>
                        </div>
                      ))}
                      {linked.testCases.length === 0 && (
                        <span className="text-xs text-gray-400">No test cases linked</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      hasCoverage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasCoverage ? 'Covered' : 'Not Covered'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requirement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Design Element
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.traceabilityLinks.map((link) => {
              const requirement = data.requirements.find(r => r.id === link.requirementId);
              const designElement = link.designElementId ? 
                data.designElements.find(d => d.id === link.designElementId) : null;
              const testCase = link.testCaseId ? 
                data.testCases.find(t => t.id === link.testCaseId) : null;

              return (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {requirement?.title || 'Unknown Requirement'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {designElement ? (
                      <div className="text-sm text-gray-900">{designElement.name}</div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {testCase ? (
                      <div className="text-sm text-gray-900">{testCase.title}</div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {link.linkType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      link.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {link.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(link)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.traceabilityLinks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No traceability links found. Click "Add Link" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traceability Matrix</h2>
          <p className="text-gray-600">Track relationships between requirements, design elements, and test cases</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'matrix' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Matrix View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              List View
            </button>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Traceability Link' : 'Add New Traceability Link'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Requirement *
                </label>
                <select
                  value={formData.requirementId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirementId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a requirement</option>
                  {data.requirements.map(req => (
                    <option key={req.id} value={req.id}>{req.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Element
                </label>
                <select
                  value={formData.designElementId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, designElementId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a design element (optional)</option>
                  {data.designElements.map(elem => (
                    <option key={elem.id} value={elem.id}>{elem.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Case
                </label>
                <select
                  value={formData.testCaseId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, testCaseId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a test case (optional)</option>
                  {data.testCases.map(test => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Type
                  </label>
                  <select
                    value={formData.linkType || 'Requirement-Design'}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Requirement-Design">Requirement-Design</option>
                    <option value="Requirement-Test">Requirement-Test</option>
                    <option value="Design-Test">Design-Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rationale
                </label>
                <textarea
                  value={formData.rationale || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rationale: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this link exists..."
                />
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

      {/* Coverage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{data.requirements.length}</div>
          <div className="text-sm text-blue-800">Total Requirements</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{data.traceabilityLinks.length}</div>
          <div className="text-sm text-green-800">Total Links</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {data.requirements.filter(req => 
              data.traceabilityLinks.some(link => 
                link.requirementId === req.id && link.status === 'Active'
              )
            ).length}
          </div>
          <div className="text-sm text-purple-800">Covered Requirements</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {data.requirements.length > 0 ? 
              Math.round((data.requirements.filter(req => 
                data.traceabilityLinks.some(link => 
                  link.requirementId === req.id && link.status === 'Active'
                )
              ).length / data.requirements.length) * 100) : 0}%
          </div>
          <div className="text-sm text-orange-800">Coverage Percentage</div>
        </div>
      </div>

      {/* Matrix or List View */}
      {viewMode === 'matrix' ? <MatrixView /> : <ListView />}
    </div>
  );
}