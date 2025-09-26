'use client';

import { SRTMData } from '../types/srtm';
import { Shield, FileText, Settings, TestTube, Link, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  data: SRTMData;
}

export default function Dashboard({ data }: DashboardProps) {
  const stats = {
    requirements: data.requirements.length,
    designElements: data.designElements.length,
    testCases: data.testCases.length,
    traceabilityLinks: data.traceabilityLinks.length,
    highPriorityReqs: data.requirements.filter(r => r.priority === 'High').length,
    passedTests: data.testCases.filter(t => t.status === 'Passed').length,
    coverage: data.traceabilityLinks.length > 0 ? 
      Math.round((data.traceabilityLinks.filter(l => l.status === 'Active').length / data.requirements.length) * 100) : 0
  };

  const statusCards = [
    {
      title: 'Security Requirements',
      value: stats.requirements,
      icon: FileText,
      color: 'blue',
      description: `${stats.highPriorityReqs} high priority`
    },
    {
      title: 'Design Elements',
      value: stats.designElements,
      icon: Settings,
      color: 'green',
      description: 'System components'
    },
    {
      title: 'Test Cases',
      value: stats.testCases,
      icon: TestTube,
      color: 'purple',
      description: `${stats.passedTests} passed`
    },
    {
      title: 'Traceability Coverage',
      value: `${stats.coverage}%`,
      icon: TrendingUp,
      color: 'orange',
      description: 'Requirements traced'
    }
  ];

  const recentActivity = [
    { action: 'Added new requirement', item: 'User Authentication', time: '2 hours ago', type: 'requirement' },
    { action: 'Updated test case', item: 'Test MFA Login', time: '4 hours ago', type: 'test' },
    { action: 'Created design element', item: 'Encryption Module', time: '1 day ago', type: 'design' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SRTM Dashboard</h2>
        <p className="text-gray-600">Overview of your security requirements traceability matrix</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-blue-50',
            green: 'bg-green-500 text-green-50',
            purple: 'bg-purple-500 text-purple-50',
            orange: 'bg-orange-500 text-orange-50'
          };

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-900">{card.title}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements Status</h3>
          <div className="space-y-3">
            {data.requirements.slice(0, 5).map(requirement => (
              <div key={requirement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{requirement.title}</p>
                  <p className="text-sm text-gray-500">{requirement.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    requirement.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    requirement.status === 'Implemented' ? 'bg-blue-100 text-blue-800' :
                    requirement.status === 'Tested' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {requirement.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    requirement.priority === 'High' ? 'bg-red-100 text-red-800' :
                    requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {requirement.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases Status</h3>
          <div className="space-y-3">
            {data.testCases.slice(0, 5).map(testCase => (
              <div key={testCase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{testCase.title}</p>
                  <p className="text-sm text-gray-500">{testCase.testType}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {testCase.status === 'Passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {testCase.status === 'Failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    testCase.status === 'Passed' ? 'bg-green-100 text-green-800' :
                    testCase.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    testCase.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {testCase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traceability Overview */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traceability Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.requirements}</p>
            <p className="text-sm text-blue-800">Total Requirements</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.traceabilityLinks}</p>
            <p className="text-sm text-green-800">Active Links</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.coverage}%</p>
            <p className="text-sm text-orange-800">Coverage</p>
          </div>
        </div>
      </div>
    </div>
  );
}