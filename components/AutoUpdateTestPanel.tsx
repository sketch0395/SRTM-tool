'use client';

import { useState } from 'react';
import { 
  AUTO_UPDATE_CONFIG, 
  checkForStigUpdates, 
  getStigDatabaseStatus,
  getAvailableBackups,
  performScheduledUpdateCheck,
  getNextUpdateCheck,
  STIG_FAMILIES
} from '../utils/stigFamilyRecommendations';
import { isSchedulerRunning } from '../utils/stigUpdateScheduler';
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export default function AutoUpdateTestPanel() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, passed: boolean, details: string) => {
    setTestResults(prev => [...prev, { test, passed, details, timestamp: new Date().toISOString() }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Configuration
      const configOk = AUTO_UPDATE_CONFIG.enabled && 
                       AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply &&
                       !AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval;
      addResult(
        'Configuration Check',
        configOk,
        `enabled=${AUTO_UPDATE_CONFIG.enabled}, autoApply=${AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply}`
      );

      // Test 2: DISA Connection
      try {
        const response = await fetch('/api/fetch-disa-rss');
        const data = await response.json();
        addResult(
          'DISA RSS Connection',
          data.success,
          `Found ${data.items?.length || 0} items in feed`
        );
      } catch (error) {
        addResult('DISA RSS Connection', false, `Error: ${error}`);
      }

      // Test 3: Update Detection
      try {
        const updates = await checkForStigUpdates();
        addResult(
          'Update Detection',
          true,
          `Found ${updates.length} potential updates`
        );
      } catch (error) {
        addResult('Update Detection', false, `Error: ${error}`);
      }

      // Test 4: Database Status
      try {
        const status = getStigDatabaseStatus();
        addResult(
          'Database Status',
          status.healthScore !== undefined,
          `Health: ${status.healthScore}%, Validated: ${status.validatedFamilies}/${status.totalStigFamilies}`
        );
      } catch (error) {
        addResult('Database Status', false, `Error: ${error}`);
      }

      // Test 5: Backup System
      try {
        const backups = getAvailableBackups();
        addResult(
          'Backup System',
          true,
          `${backups.length} backups available`
        );
      } catch (error) {
        addResult('Backup System', false, `Error: ${error}`);
      }

      // Test 6: Scheduler
      try {
        const running = isSchedulerRunning();
        const nextCheck = getNextUpdateCheck();
        addResult(
          'Update Scheduler',
          running,
          running ? `Next check: ${nextCheck}` : 'Scheduler not running'
        );
      } catch (error) {
        addResult('Update Scheduler', false, `Error: ${error}`);
      }

      // Test 7: STIG Data Integrity
      try {
        const stigCount = STIG_FAMILIES.length;
        const validatedCount = STIG_FAMILIES.filter(s => s.validated).length;
        addResult(
          'STIG Data Integrity',
          stigCount > 0,
          `${stigCount} STIG families loaded, ${validatedCount} validated`
        );
      } catch (error) {
        addResult('STIG Data Integrity', false, `Error: ${error}`);
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runScheduledCheck = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running scheduled check test...');
      await performScheduledUpdateCheck();
      addResult(
        'Scheduled Check Test',
        true,
        'Check completed - see console for details'
      );
    } catch (error) {
      addResult('Scheduled Check Test', false, `Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🧪 Auto-Update Test Panel</h2>
          <p className="text-sm text-gray-600">Validate the automatic STIG update system</p>
        </div>
        {testResults.length > 0 && (
          <div className={`px-4 py-2 rounded-lg ${
            passedCount === totalCount ? 'bg-green-100 text-green-800' :
            passedCount > totalCount / 2 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <div className="font-bold text-lg">
              {passedCount}/{totalCount} Passed
            </div>
            <div className="text-xs">
              {((passedCount / totalCount) * 100).toFixed(0)}% Success Rate
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <button
          onClick={runScheduledCheck}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          Test Scheduled Check
        </button>

        {testResults.length > 0 && (
          <button
            onClick={() => setTestResults([])}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Clear Results
          </button>
        )}
      </div>

      {testResults.length > 0 && (
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.passed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.passed)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {result.test}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {result.details}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No Tests Run Yet</p>
          <p className="text-sm">Click "Run All Tests" to validate the auto-update system</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Auto-Update:</span>
            <span className={`ml-2 font-medium ${AUTO_UPDATE_CONFIG.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {AUTO_UPDATE_CONFIG.enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Auto-Apply:</span>
            <span className={`ml-2 font-medium ${AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? 'text-green-600' : 'text-red-600'}`}>
              {AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Check Frequency:</span>
            <span className="ml-2 font-medium text-gray-900">
              {AUTO_UPDATE_CONFIG.checkFrequency}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last Check:</span>
            <span className="ml-2 font-medium text-gray-900">
              {AUTO_UPDATE_CONFIG.lastCheck}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <strong>💡 Tip:</strong> Open the browser console (F12) to see detailed logs during testing.
        All automatic update operations log their progress there.
      </div>
    </div>
  );
}