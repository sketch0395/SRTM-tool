'use client';

import { useState } from 'react';
import { SystemDesignElement } from '../types/srtm';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface DesignElementFormProps {
  designElements: SystemDesignElement[];
  onUpdate: (designElements: SystemDesignElement[]) => void;
  onNavigateToNext?: () => void;
}

export default function DesignElementForm({ designElements, onUpdate, onNavigateToNext }: DesignElementFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SystemDesignElement>>({
    name: '',
    type: 'Component',
    description: '',
    technology: '',
    owner: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = designElements.map(elem => 
        elem.id === editingId 
          ? { ...elem, ...formData, updatedAt: new Date() }
          : elem
      );
      onUpdate(updated);
    } else {
      const newElement: SystemDesignElement = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type!,
        description: formData.description!,
        technology: formData.technology,
        owner: formData.owner,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onUpdate([...designElements, newElement]);
    }

    resetForm();
  };

  const handleEdit = (element: SystemDesignElement) => {
    setFormData(element);
    setEditingId(element.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this design element?')) {
      onUpdate(designElements.filter(elem => elem.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Component',
      description: '',
      technology: '',
      owner: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Design Elements</h2>
          <p className="text-gray-600">Define system components, modules, and interfaces</p>
          <div className="mt-2 text-sm text-blue-600">
            <strong>Step 1:</strong> Start by defining your system's design elements before categorization
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Design Element
        </button>
      </div>

      {/* Workflow Progress */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-blue-600 font-medium">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">1</div>
              Design Elements
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center text-gray-400">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs mr-2">2</div>
              NIST 800-60 Categorization
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center text-gray-400">
              <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs mr-2">3</div>
              NIST 800-53 Requirements
            </div>
          </div>
          {designElements.length > 0 && (
            <div className="text-sm text-green-600 font-medium">
              ✓ {designElements.length} element{designElements.length !== 1 ? 's' : ''} defined
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
                {editingId ? 'Edit Design Element' : 'Add New Design Element'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type || 'Component'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Component">Component</option>
                  <option value="Module">Module</option>
                  <option value="Interface">Interface</option>
                  <option value="Service">Service</option>
                  <option value="Database">Database</option>
                  <option value="API">API</option>
                </select>
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
                    Technology
                  </label>
                  <input
                    type="text"
                    value={formData.technology || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, technology: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Node.js, React, AES-256"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={formData.owner || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Development Team, Security Team"
                  />
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

      {/* Design Elements List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technology
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {designElements.map((element) => (
                <tr key={element.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {element.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {element.description.substring(0, 100)}
                        {element.description.length > 100 && '...'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {element.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {element.technology || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {element.owner || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(element)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(element.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {designElements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No design elements found. Click "Add Design Element" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Next Step Navigation */}
        {designElements.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Design Elements Complete!</h4>
                <p className="text-sm text-green-600">Ready to proceed to system categorization</p>
              </div>
              {onNavigateToNext && (
                <button
                  onClick={onNavigateToNext}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next: NIST 800-60 Categorization →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}