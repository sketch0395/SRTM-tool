'use client';

import { useState, useEffect } from 'react';
import { SecurityRequirement, SystemDesignElement } from '../types/srtm';
import { 
  getStigFamilyRecommendations, 
  getImplementationEffort, 
  StigFamilyRecommendation, 
  getStigDatabaseStatus,
  getPendingUpdates,
  setAutoUpdateEnabled,
  AUTO_UPDATE_CONFIG
} from '../utils/stigFamilyRecommendations';
import { stigRequirementsDatabase, getStoredStigRequirements, getUniqueStigRequirementCount } from '../utils/detailedStigRequirements';
import { Shield, Target, Clock, AlertTriangle, CheckCircle, Info, Download, CheckSquare, ChevronDown, ChevronRight, HelpCircle, Settings, RefreshCw } from 'lucide-react';

interface StigRecommendationProps {
  requirements: SecurityRequirement[];
  designElements: SystemDesignElement[];
  onLoadStigFamilies: (selectedIds: string[]) => void;
}

export default function StigFamilyRecommendations({ requirements, designElements, onLoadStigFamilies }: StigRecommendationProps) {
  const [recommendations, setRecommendations] = useState<StigFamilyRecommendation[]>([]);
  const [selectedStigIds, setSelectedStigIds] = useState<Set<string>>(new Set());
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [showTechBonusTooltip, setShowTechBonusTooltip] = useState<string | null>(null);
  const [showEnvBonusTooltip, setShowEnvBonusTooltip] = useState<string | null>(null);
  const [showPenaltiesTooltip, setShowPenaltiesTooltip] = useState<string | null>(null);
  const [showKeywordTooltip, setShowKeywordTooltip] = useState<string | null>(null);
  const [showControlFamilyTooltip, setShowControlFamilyTooltip] = useState<string | null>(null);
  const [showDesignElementTooltip, setShowDesignElementTooltip] = useState<string | null>(null);
  const [showEffortTooltip, setShowEffortTooltip] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateResults, setUpdateResults] = useState<any[]>([]);
  const [autoUpdateEnabled, setAutoUpdateEnabledState] = useState(AUTO_UPDATE_CONFIG.enabled);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedUpdates, setSelectedUpdates] = useState<Set<string>>(new Set());
  const [isApplyingUpdates, setIsApplyingUpdates] = useState(false);
  const [dbStatus, setDbStatus] = useState(getStigDatabaseStatus());

  // Refresh database status
  const refreshDbStatus = () => {
    setDbStatus(getStigDatabaseStatus());
  };

  useEffect(() => {
    if (requirements.length > 0 || designElements.length > 0) {
      const recs = getStigFamilyRecommendations(requirements, designElements);
      setRecommendations(recs);
    }
  }, [requirements, designElements]);

  // Auto-refresh database status when recommendations change
  useEffect(() => {
    refreshDbStatus();
  }, [recommendations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-dropdown-container')) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsDropdown]);

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

  const getRequirementCount = (stigFamily: any): number => {
    // Use validated actualRequirements from STIG family data
    if (stigFamily.actualRequirements) {
      return stigFamily.actualRequirements;
    }
    
    // Fallback to uploaded STIG requirements (unique count by title)
    const uploadedRequirements = getStoredStigRequirements(stigFamily.id);
    if (uploadedRequirements.length > 0) {
      // Count unique titles instead of total requirements
      const uniqueTitles = new Set(uploadedRequirements.map(req => req.title?.trim()).filter(Boolean));
      return uniqueTitles.size;
    }
    
    // Fallback to database (legacy)
    const requirements = stigRequirementsDatabase[stigFamily.id];
    if (requirements) {
      const uniqueTitles = new Set(requirements.map(req => req.title?.trim()).filter(Boolean));
      return uniqueTitles.size;
    }
    return 0;
  };

  const getTotalSelectedRequirements = (): { unique: number; total: number } => {
    let uniqueCount = 0;
    let totalCount = 0;
    
    Array.from(selectedStigIds).forEach(stigId => {
      const recommendation = recommendations.find(rec => rec.stigFamily.id === stigId);
      if (!recommendation) return;
      
      // Get unique count (by title)
      uniqueCount += getRequirementCount(recommendation.stigFamily);
      
      // Get total count (all individual requirements)
      const uploadedRequirements = getStoredStigRequirements(stigId);
      if (uploadedRequirements.length > 0) {
        totalCount += uploadedRequirements.length;
      } else {
        // Fallback to actualRequirements if no uploaded data
        totalCount += recommendation.stigFamily.actualRequirements || 0;
      }
    });
    
    return { unique: uniqueCount, total: totalCount };
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

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateResults([]); // Clear previous results
    
    try {
      console.log('🔍 Checking DISA for STIG updates...');
      const response = await fetch('/api/stig-updates?action=check');
      const data = await response.json();
      
      if (data.success) {
        setUpdateResults(data.updates);
        console.log('✅ Update check complete:', data.updates);
        
        if (data.count === 0) {
          alert('✅ All STIGs are up to date! No updates found.');
        } else {
          alert(`📋 Found ${data.count} potential update${data.count > 1 ? 's' : ''}!\n\nCheck the settings dropdown or console for details.`);
        }
      } else {
        console.error('❌ Update check failed:', data.error);
        alert('⚠️ Could not check for updates. The DISA RSS feed may be unavailable.\n\nUsing fallback date-based checking instead.');
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      alert('❌ Error checking for updates. Check console for details and ensure you have internet connectivity.');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleToggleAutoUpdate = async () => {
    try {
      const response = await fetch('/api/stig-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'enable', 
          enabled: !autoUpdateEnabled 
        })
      });
      const data = await response.json();
      if (data.success) {
        setAutoUpdateEnabledState(!autoUpdateEnabled);
        setAutoUpdateEnabled(!autoUpdateEnabled);
        alert(data.message);
      }
    } catch (error) {
      console.error('Error toggling auto-update:', error);
      alert('Error updating configuration');
    }
  };

  const handleToggleUpdateSelection = (stigId: string) => {
    setSelectedUpdates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stigId)) {
        newSet.delete(stigId);
      } else {
        newSet.add(stigId);
      }
      return newSet;
    });
  };

  const handleSelectAllUpdates = () => {
    setSelectedUpdates(new Set(updateResults.map(u => u.stigId)));
  };

  const handleDeselectAllUpdates = () => {
    setSelectedUpdates(new Set());
  };

  const handleApplySelectedUpdates = async () => {
    if (selectedUpdates.size === 0) {
      alert('Please select at least one update to apply');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to apply ${selectedUpdates.size} update(s)?\n\n` +
      `This will:\n` +
      `• Update STIG versions and release dates\n` +
      `• Create automatic backups (can be rolled back)\n` +
      `• Mark updated STIGs as unvalidated\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    setIsApplyingUpdates(true);
    try {
      const updatesToApply = updateResults.filter(u => selectedUpdates.has(u.stigId));
      
      console.log('📝 Applying updates:', updatesToApply);
      
      const response = await fetch('/api/stig-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-multiple',
          updates: updatesToApply
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { successful, failed } = data.summary;
        
        // Show detailed results
        let message = `✅ Update Complete!\n\n`;
        message += `Successfully applied: ${successful}\n`;
        if (failed > 0) {
          message += `Failed: ${failed}\n`;
        }
        message += `\nBackups created for rollback if needed.`;
        
        alert(message);
        
        // Clear selections and refresh
        setSelectedUpdates(new Set());
        
        // Remove successfully applied updates from results
        const failedStigIds = data.results
          .filter((r: any) => !r.success)
          .map((r: any) => r.stigId);
        
        setUpdateResults(prev => prev.filter(u => failedStigIds.includes(u.stigId)));
        
        // Refresh database status to reflect updates
        refreshDbStatus();
        
        // Log detailed results
        console.log('✅ Update Results:', data.results);
        
      } else {
        alert(`❌ Failed to apply updates: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error applying updates:', error);
      alert('❌ Error applying updates. Check console for details.');
    } finally {
      setIsApplyingUpdates(false);
    }
  };

  const handleExportDatabase = async () => {
    try {
      const response = await fetch('/api/stig-updates?action=export');
      const data = await response.json();
      
      if (data.success) {
        // Create download link
        const blob = new Blob([data.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ Database exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('❌ Error exporting database');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">STIG Family Recommendations</h2>
          <p className="text-gray-600">Based on {requirements.length} requirements and {designElements.length} design elements</p>
        </div>
        
        {/* Settings Dropdown */}
        <div className="relative settings-dropdown-container">
          <button
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Auto-Update Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showSettingsDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showSettingsDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">Automatic Update Checking</h3>
                  <p className="text-xs text-gray-600">Automatically check DISA for new STIG releases</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`h-4 w-4 ${autoUpdateEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Auto-Check Status</span>
                  </div>
                  <button
                    onClick={handleToggleAutoUpdate}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      autoUpdateEnabled 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {autoUpdateEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download className={`h-4 w-4 ${AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Auto-Apply Updates</span>
                      <span className="text-xs text-gray-500">Automatically install updates from DISA</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply = !AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply;
                      alert(`Auto-apply ${AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? 'enabled' : 'disabled'}. Updates will ${AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? 'automatically install' : 'require manual approval'}.`);
                      setShowSettingsDropdown(false);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? '✓ Enabled' : '✗ Disabled'}
                  </button>
                </div>
                
                {AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                    <strong>🤖 Fully Automatic:</strong> Updates from DISA will be applied automatically without manual approval.
                  </div>
                )}
                
                {autoUpdateEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium text-gray-900">{AUTO_UPDATE_CONFIG.checkFrequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Check:</span>
                        <span className="font-medium text-gray-900">{AUTO_UPDATE_CONFIG.lastCheck}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Check:</span>
                        <span className="font-medium text-gray-900">
                          {(() => {
                            const lastCheck = new Date(AUTO_UPDATE_CONFIG.lastCheck);
                            const nextCheck = new Date(lastCheck);
                            switch (AUTO_UPDATE_CONFIG.checkFrequency) {
                              case 'daily': nextCheck.setDate(nextCheck.getDate() + 1); break;
                              case 'weekly': nextCheck.setDate(nextCheck.getDate() + 7); break;
                              case 'monthly': nextCheck.setMonth(nextCheck.getMonth() + 1); break;
                            }
                            return nextCheck.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <button
                    onClick={() => {
                      handleCheckForUpdates();
                      setShowSettingsDropdown(false);
                    }}
                    disabled={isCheckingUpdates}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium">
                      {isCheckingUpdates ? 'Checking DISA...' : 'Check for Updates Now'}
                    </span>
                  </button>
                </div>
                
                {updateResults.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {updateResults.length} Update{updateResults.length > 1 ? 's' : ''} Found:
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedUpdates.size > 0 && (
                          <button
                            onClick={handleDeselectAllUpdates}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={handleSelectAllUpdates}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Select All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                      {updateResults.map((update, index) => {
                        const isSelected = selectedUpdates.has(update.stigId);
                        return (
                          <div
                            key={index}
                            onClick={() => handleToggleUpdateSelection(update.stigId)}
                            className={`cursor-pointer border rounded p-2 text-xs transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <CheckSquare className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{update.stigId}</div>
                                <div className="text-gray-600">{update.updateNotes || 'Update available'}</div>
                                {update.latestVersion && (
                                  <div className={`font-medium mt-1 ${
                                    isSelected ? 'text-blue-700' : 'text-yellow-700'
                                  }`}>
                                    {update.currentVersion} → {update.latestVersion}
                                  </div>
                                )}
                                {update.severity && (
                                  <div className="mt-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                      update.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                      update.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                      update.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {update.severity.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {selectedUpdates.size > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <button
                          onClick={handleApplySelectedUpdates}
                          disabled={isApplyingUpdates}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className={`h-4 w-4 ${isApplyingUpdates ? 'animate-bounce' : ''}`} />
                          <span className="text-sm font-medium">
                            {isApplyingUpdates 
                              ? 'Applying Updates...' 
                              : `Apply ${selectedUpdates.size} Selected Update${selectedUpdates.size > 1 ? 's' : ''}`
                            }
                          </span>
                        </button>
                        <div className="text-xs text-gray-600 text-center">
                          Backups will be created automatically
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-2 mt-2">
                      <button
                        onClick={handleExportDatabase}
                        className="w-full text-xs text-gray-600 hover:text-gray-800 py-1"
                      >
                        💾 Export Database Backup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STIG Database Status */}
      <div className={`border rounded-lg p-4 mb-6 ${
        dbStatus.healthScore >= 80 ? 'bg-green-50 border-green-200' :
        dbStatus.healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  STIG Database Status
                  <button
                    onClick={refreshDbStatus}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="Refresh database status"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-xs text-gray-600">
                  {dbStatus.validatedFamilies}/{dbStatus.totalStigFamilies} families validated ({dbStatus.validationPercentage}%)
                  {dbStatus.outdatedFamilies > 0 && ` • ${dbStatus.outdatedFamilies} may need updates`}
                </div>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              dbStatus.healthScore >= 80 ? 'bg-green-100 text-green-800' :
              dbStatus.healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Health: {dbStatus.healthScore}%
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {dbStatus.isReviewOverdue ? (
              <span className="text-red-600 font-medium">Review Overdue</span>
            ) : (
              `Next review: ${dbStatus.daysUntilReview} days`
            )}
          </div>
        </div>
        {(dbStatus.isReviewOverdue || dbStatus.healthScore < 70) && (
          <div className="mt-2 pt-2 border-t border-current border-opacity-20">
            <div className="text-xs text-gray-700">
              <strong>⚠️ Action Needed:</strong> STIG data requires manual updates. 
              Last validated: {dbStatus.lastValidated}
              {dbStatus.criticalUpdatesNeeded.length > 0 && (
                <div className="mt-1">
                  Critical updates: {dbStatus.criticalUpdatesNeeded.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
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
                    {(() => {
                      const counts = getTotalSelectedRequirements();
                      return `${counts.unique} unique requirements (${counts.total} total instances) ready to load`;
                    })()}
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
                {(() => {
                  const counts = getTotalSelectedRequirements();
                  return `Load ${selectedStigIds.size} STIG Families (${counts.unique} Unique Requirements)`;
                })()}
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
          const requirementCount = getRequirementCount(recommendation.stigFamily);
          
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
                      <div className="text-xs text-gray-500 mt-1">unique titles</div>
                      {(() => {
                        const uploadedRequirements = getStoredStigRequirements(recommendation.stigFamily.id);
                        const totalCount = uploadedRequirements.length || recommendation.stigFamily.actualRequirements || 0;
                        if (totalCount > requirementCount) {
                          return <div className="text-xs text-gray-400 mt-1">({totalCount} total instances)</div>;
                        }
                        return null;
                      })()}
                      {recommendation.stigFamily.validated && (
                        <div className="text-xs text-green-600 mt-1 flex items-center">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Validated
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Confidence Score</div>
                      <div className="text-lg font-semibold text-gray-900">{recommendation.confidenceScore || 0}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-sm text-gray-500">
                        Est. Effort
                        <div className="relative ml-1">
                          <Info
                            className="h-3 w-3 cursor-help text-gray-400 hover:text-gray-600"
                            onMouseEnter={() => setShowEffortTooltip(recommendation.stigFamily.id)}
                            onMouseLeave={() => setShowEffortTooltip(null)}
                          />
                          {showEffortTooltip === recommendation.stigFamily.id && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                              <div className="font-medium mb-1">Effort Estimation</div>
                              <div>• 1.5 hours per requirement (avg)</div>
                              <div>• Includes implementation, documentation,</div>
                              <div>&nbsp;&nbsp;testing, and review</div>
                              <div>• Days calculated @ 8 hours/day</div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round(requirementCount * 1.5)} hrs
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ~{Math.ceil((requirementCount * 1.5) / 8)} days @ 8hrs/day
                      </div>
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
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                            {recommendation.reasoning.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                          
                          {/* Score Breakdown */}
                          {recommendation.scoreBreakdown && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown</h5>
                              <div className="space-y-1 text-xs text-gray-600">
                                {recommendation.scoreBreakdown.keywordMatches > 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Keyword Matches:</span>
                                      <button
                                        onMouseEnter={() => setShowKeywordTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowKeywordTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showKeywordTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Keyword Matches Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> +2 points per keyword match (or +3 for application security STIGs). Keywords from your requirements/design elements match this STIG's trigger words.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Higher keyword matches indicate stronger alignment between your stated requirements and this STIG's security controls.
                                            </div>
                                            <div>
                                              <strong>Examples:</strong> Terms like "authentication", "encryption", "database", "web application" in your requirements match relevant STIG families.
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-green-600">+{recommendation.scoreBreakdown.keywordMatches.toFixed(1)}</span>
                                  </div>
                                )}
                                {recommendation.scoreBreakdown.controlFamilyMatches > 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Control Family Matches:</span>
                                      <button
                                        onMouseEnter={() => setShowControlFamilyTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowControlFamilyTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showControlFamilyTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Control Family Matches Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> +3 points per NIST SP 800-53 control family match between your requirements and this STIG's applicable families.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Control family alignment ensures this STIG addresses the same security domains as your existing requirements.
                                            </div>
                                            <div>
                                              <strong>Examples:</strong> AC (Access Control), AU (Audit), IA (Identification & Authentication), SC (System & Communications Protection).
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-green-600">+{recommendation.scoreBreakdown.controlFamilyMatches.toFixed(1)}</span>
                                  </div>
                                )}
                                {recommendation.scoreBreakdown.designElementMatches > 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Design Element Matches:</span>
                                      <button
                                        onMouseEnter={() => setShowDesignElementTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowDesignElementTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showDesignElementTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Design Element Matches Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> +2 points per keyword match and +3 points per system type match in your design elements.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Your system architecture and components directly determine which security controls are applicable and necessary.
                                            </div>
                                            <div>
                                              <strong>Examples:</strong> A "PostgreSQL Database" design element matches database STIGs; "Apache Web Server" matches web server STIGs.
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-green-600">+{recommendation.scoreBreakdown.designElementMatches.toFixed(1)}</span>
                                  </div>
                                )}
                                {recommendation.scoreBreakdown.technologySpecificBonus > 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Technology Bonus:</span>
                                      <button
                                        onMouseEnter={() => setShowTechBonusTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowTechBonusTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showTechBonusTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Technology Bonus Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> +6 points awarded when your system design elements contain technologies that exactly match this STIG's requirements.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Direct technology matches indicate this STIG is highly relevant to your specific technology stack, ensuring security controls are tailored to your actual infrastructure.
                                            </div>
                                            <div>
                                              <strong>Detected matches:</strong> Technologies like PostgreSQL, Docker, Kubernetes, or Apache in your design elements trigger specific STIG recommendations.
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-green-600">+{recommendation.scoreBreakdown.technologySpecificBonus.toFixed(1)}</span>
                                  </div>
                                )}
                                {recommendation.scoreBreakdown.environmentBonus > 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Environment Bonus:</span>
                                      <button
                                        onMouseEnter={() => setShowEnvBonusTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowEnvBonusTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showEnvBonusTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Environment Bonus Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> +5 points awarded when application security STIGs are recommended for development environments.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Development environments with applications, APIs, databases, and web services require stronger application security controls to protect against common development-related vulnerabilities.
                                            </div>
                                            <div>
                                              <strong>Detection criteria:</strong> System contains elements like Node.js, JavaScript, PostgreSQL, APIs, web servers, or application components.
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-green-600">+{recommendation.scoreBreakdown.environmentBonus.toFixed(1)}</span>
                                  </div>
                                )}
                                {recommendation.scoreBreakdown.penalties !== 0 && (
                                  <div className="flex justify-between items-center relative">
                                    <div className="flex items-center">
                                      <span>Penalties:</span>
                                      <button
                                        onMouseEnter={() => setShowPenaltiesTooltip(recommendation.stigFamily.id)}
                                        onMouseLeave={() => setShowPenaltiesTooltip(null)}
                                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <HelpCircle className="h-3 w-3" />
                                      </button>
                                      {showPenaltiesTooltip === recommendation.stigFamily.id && (
                                        <div className="absolute z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                          <div className="font-semibold mb-2">Infrastructure Penalty Explanation</div>
                                          <div className="space-y-2">
                                            <div>
                                              <strong>How it's calculated:</strong> -3 points applied to infrastructure STIGs when detected in development environments.
                                            </div>
                                            <div>
                                              <strong>Why it matters:</strong> Infrastructure STIGs (like Windows Server, Cisco, VMware) are typically lower priority for application development projects, which focus more on application security.
                                            </div>
                                            <div>
                                              <strong>When applied:</strong> System is detected as a development environment but matches infrastructure-focused STIG families.
                                            </div>
                                          </div>
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium text-red-600">{recommendation.scoreBreakdown.penalties.toFixed(1)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-1 border-t border-gray-300 font-semibold">
                                  <span>Confidence Score:</span>
                                  <span className="text-blue-600">{recommendation.confidenceScore}%</span>
                                </div>
                              </div>
                            </div>
                          )}
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
                  {(() => {
                    const counts = getTotalSelectedRequirements();
                    return `This will add ${counts.unique} unique security requirements (${counts.total} total instances) to your project`;
                  })()}
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