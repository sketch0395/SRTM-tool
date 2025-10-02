import { NextRequest, NextResponse } from 'next/server';
import { 
  checkForStigUpdates, 
  getPendingUpdates, 
  setAutoUpdateEnabled, 
  performScheduledUpdateCheck,
  getNextUpdateCheck,
  AUTO_UPDATE_CONFIG,
  applyStigUpdate,
  applyMultipleStigUpdates,
  rollbackStigUpdate,
  getAvailableBackups,
  exportStigDatabase,
  importStigDatabase
} from '../../../utils/stigFamilyRecommendations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'check':
        // Perform immediate update check
        const updates = await checkForStigUpdates();
        return NextResponse.json({
          success: true,
          updates,
          count: updates.length,
          lastChecked: new Date().toISOString()
        });

      case 'database-status':
        // Get database health status
        const { getStigDatabaseStatus } = await import('../../../utils/stigFamilyRecommendations');
        const dbStatus = getStigDatabaseStatus();
        return NextResponse.json({
          success: true,
          status: dbStatus
        });

      case 'pending':
        // Get pending updates
        const pending = getPendingUpdates();
        return NextResponse.json({
          success: true,
          pending,
          count: pending.length
        });

      case 'status':
        // Get auto-update configuration status
        return NextResponse.json({
          success: true,
          config: AUTO_UPDATE_CONFIG,
          nextCheck: getNextUpdateCheck()
        });

      case 'scheduled':
        // Perform scheduled check (called by cron job or similar)
        await performScheduledUpdateCheck();
        return NextResponse.json({
          success: true,
          message: 'Scheduled update check completed'
        });

      case 'force-check':
        // Force check and apply updates (bypasses schedule)
        console.log('🚀 Force checking and applying updates...');
        const forceUpdates = await checkForStigUpdates();
        
        if (forceUpdates.length > 0) {
          console.log(`📋 Found ${forceUpdates.length} potential updates`);
          
          // Apply if autoApply is enabled
          if (AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply) {
            let toApply = forceUpdates;
            if (AUTO_UPDATE_CONFIG.autoUpdatePreferences.criticalOnly) {
              toApply = forceUpdates.filter(u => 
                u.severity === 'critical' || u.severity === 'high'
              );
            }
            
            const results = applyMultipleStigUpdates(toApply);
            const successCount = results.filter(r => r.success).length;
            
            // Mark as validated
            const { STIG_FAMILIES } = await import('../../../utils/stigFamilyRecommendations');
            results.forEach((r) => {
              if (r.success) {
                const stigIndex = STIG_FAMILIES.findIndex((s: any) => s.id === r.stigId);
                if (stigIndex !== -1) {
                  STIG_FAMILIES[stigIndex].validated = true;
                }
              }
            });
            
            return NextResponse.json({
              success: true,
              message: `Applied ${successCount}/${results.length} updates`,
              results,
              totalUpdatesFound: forceUpdates.length,
              updatesApplied: successCount
            });
          }
        }
        
        return NextResponse.json({
          success: true,
          message: 'No updates to apply',
          totalUpdatesFound: forceUpdates.length
        });

      case 'backups':
        // Get available backups
        const backups = getAvailableBackups();
        return NextResponse.json({
          success: true,
          backups
        });

      case 'export':
        // Export database
        const exportData = exportStigDatabase();
        return NextResponse.json({
          success: true,
          data: exportData,
          filename: `stig-database-backup-${new Date().toISOString().split('T')[0]}.json`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: check, pending, status, database-status, scheduled, force-check, backups, or export'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('STIG update API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process STIG update request'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, enabled, frequency, updates, stigId, importData } = body;

    switch (action) {
      case 'enable':
        setAutoUpdateEnabled(enabled);
        return NextResponse.json({
          success: true,
          message: `Auto-update ${enabled ? 'enabled' : 'disabled'}`,
          config: AUTO_UPDATE_CONFIG
        });

      case 'configure':
        // Update configuration
        if (frequency) {
          AUTO_UPDATE_CONFIG.checkFrequency = frequency;
        }
        return NextResponse.json({
          success: true,
          message: 'Configuration updated',
          config: AUTO_UPDATE_CONFIG
        });

      case 'apply-update':
        // Apply a single update
        if (!updates || updates.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No update data provided'
          }, { status: 400 });
        }
        const singleResult = applyStigUpdate(updates[0]);
        return NextResponse.json({
          success: singleResult.success,
          result: singleResult,
          message: singleResult.message
        });

      case 'apply-multiple':
        // Apply multiple updates in batch
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No updates provided'
          }, { status: 400 });
        }
        const results = applyMultipleStigUpdates(updates);
        const successCount = results.filter(r => r.success).length;
        return NextResponse.json({
          success: true,
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: results.length - successCount
          },
          message: `Applied ${successCount} of ${results.length} updates`
        });

      case 'rollback':
        // Rollback a specific STIG
        if (!stigId) {
          return NextResponse.json({
            success: false,
            error: 'stigId required for rollback'
          }, { status: 400 });
        }
        const rollbackResult = rollbackStigUpdate(stigId);
        return NextResponse.json(rollbackResult);

      case 'import':
        // Import database from backup
        if (!importData) {
          return NextResponse.json({
            success: false,
            error: 'Import data required'
          }, { status: 400 });
        }
        const importResult = importStigDatabase(importData);
        return NextResponse.json(importResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: enable, configure, apply-update, apply-multiple, rollback, or import'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('STIG update POST API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process STIG update configuration'
    }, { status: 500 });
  }
}