/**
 * STIG Update Scheduler
 * Handles periodic checking for STIG updates
 */

import { performScheduledUpdateCheck, AUTO_UPDATE_CONFIG } from './stigFamilyRecommendations';

let updateInterval: NodeJS.Timeout | null = null;

/**
 * Start the automatic update scheduler
 */
export function startUpdateScheduler(): void {
  if (!AUTO_UPDATE_CONFIG.enabled) {
    console.log('❌ Auto-update is disabled. Enable it first.');
    return;
  }

  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  let intervalMs: number;
  switch (AUTO_UPDATE_CONFIG.checkFrequency) {
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'monthly':
      intervalMs = 30 * 24 * 60 * 60 * 1000; // 30 days
      break;
    default:
      intervalMs = 7 * 24 * 60 * 60 * 1000; // Default to weekly
  }

  updateInterval = setInterval(async () => {
    console.log('🔄 Running scheduled STIG update check...');
    await performScheduledUpdateCheck();
  }, intervalMs);

  console.log(`✅ STIG update scheduler started (${AUTO_UPDATE_CONFIG.checkFrequency})`);
}

/**
 * Stop the automatic update scheduler
 */
export function stopUpdateScheduler(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('🛑 STIG update scheduler stopped');
  }
}

/**
 * Check if scheduler is running
 */
export function isSchedulerRunning(): boolean {
  return updateInterval !== null;
}

/**
 * Initialize scheduler on app startup (if enabled)
 */
export function initializeScheduler(): void {
  if (AUTO_UPDATE_CONFIG.enabled) {
    startUpdateScheduler();
  }
}

// Browser-specific: Use Page Visibility API to pause/resume when tab is hidden
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, could pause intensive operations
      console.log('📱 Page hidden - STIG scheduler continues in background');
    } else {
      // Page is visible, resume normal operations
      console.log('👁️ Page visible - STIG scheduler active');
    }
  });
}

// For Next.js development: Hot reload cleanup
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__stig_scheduler_cleanup = stopUpdateScheduler;
}