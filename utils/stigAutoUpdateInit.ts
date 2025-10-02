/**
 * STIG Auto-Update System Initialization
 * Call this from your main application startup
 */

import { 
  setAutoUpdateEnabled, 
  AUTO_UPDATE_CONFIG, 
  performScheduledUpdateCheck 
} from './stigFamilyRecommendations';
import { 
  initializeScheduler, 
  startUpdateScheduler, 
  isSchedulerRunning 
} from './stigUpdateScheduler';

/**
 * Initialize the STIG auto-update system
 * Call this once when your application starts
 */
export async function initializeStigAutoUpdate(): Promise<void> {
  console.log('🚀 Initializing STIG Auto-Update System...');
  
  try {
    // Initialize the scheduler
    initializeScheduler();
    
    // Log current configuration
    console.log('📋 Auto-Update Configuration:');
    console.log(`   • Enabled: ${AUTO_UPDATE_CONFIG.enabled ? '✅' : '❌'}`);
    console.log(`   • Frequency: ${AUTO_UPDATE_CONFIG.checkFrequency}`);
    console.log(`   • Last Check: ${AUTO_UPDATE_CONFIG.lastCheck}`);
    console.log(`   • Sources: DISA RSS(${AUTO_UPDATE_CONFIG.sources.disaRss ? '✅' : '❌'}), STIG Viewer(${AUTO_UPDATE_CONFIG.sources.stigViewer ? '✅' : '❌'})`);
    console.log(`   • Notifications: In-App(${AUTO_UPDATE_CONFIG.notifications.inApp ? '✅' : '❌'}), Email(${AUTO_UPDATE_CONFIG.notifications.email ? '✅' : '❌'})`);
    
    // Check if scheduler is running
    if (isSchedulerRunning()) {
      console.log('⏰ Update scheduler is running');
    } else if (AUTO_UPDATE_CONFIG.enabled) {
      console.log('⚠️ Auto-update enabled but scheduler not running - starting now...');
      startUpdateScheduler();
    } else {
      console.log('💤 Auto-update is disabled');
    }
    
    console.log('✅ STIG Auto-Update System initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize STIG Auto-Update System:', error);
  }
}

/**
 * Quick setup for development/testing
 * Enables auto-update with safe defaults
 */
export function enableAutoUpdateForDevelopment(): void {
  console.log('🛠️ Enabling STIG auto-update for development...');
  
  // Enable with safe settings
  AUTO_UPDATE_CONFIG.enabled = true;
  AUTO_UPDATE_CONFIG.checkFrequency = 'daily';
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.criticalOnly = true;
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval = true;
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.backupBeforeUpdate = true;
  
  setAutoUpdateEnabled(true);
  startUpdateScheduler();
  
  console.log('✅ Auto-update enabled for development with safe defaults');
}

/**
 * Production setup with security-focused configuration
 */
export function enableAutoUpdateForProduction(): void {
  console.log('🏢 Configuring STIG auto-update for production...');
  
  // Production-safe settings
  AUTO_UPDATE_CONFIG.enabled = true;
  AUTO_UPDATE_CONFIG.checkFrequency = 'weekly';
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.criticalOnly = true;
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval = true;
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.backupBeforeUpdate = true;
  AUTO_UPDATE_CONFIG.notifications.inApp = true;
  AUTO_UPDATE_CONFIG.notifications.email = false; // Configure separately
  
  setAutoUpdateEnabled(true);
  startUpdateScheduler();
  
  console.log('✅ Auto-update configured for production environment');
}

/**
 * Perform a test of the auto-update system
 */
export async function testAutoUpdateSystem(): Promise<boolean> {
  console.log('🧪 Testing STIG auto-update system...');
  
  try {
    // Test scheduled check
    await performScheduledUpdateCheck();
    
    // Test scheduler status
    const schedulerRunning = isSchedulerRunning();
    
    console.log(`📊 Test Results:`);
    console.log(`   • Scheduler Status: ${schedulerRunning ? '✅ Running' : '❌ Not Running'}`);
    console.log(`   • Configuration: ${AUTO_UPDATE_CONFIG.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   • Last Check: ${AUTO_UPDATE_CONFIG.lastCheck}`);
    
    const success = schedulerRunning && AUTO_UPDATE_CONFIG.enabled;
    console.log(`🎯 Overall Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
    
    return success;
    
  } catch (error) {
    console.error('❌ Auto-update system test failed:', error);
    return false;
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStigAutoUpdate);
  } else {
    // Page already loaded
    setTimeout(initializeStigAutoUpdate, 1000);
  }
}