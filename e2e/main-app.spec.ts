import { test, expect } from '@playwright/test';

test.describe('SRTM Tool - Main Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/SRTM Tool/i);
  });

  test('should display all main tabs', async ({ page }) => {
    // Check for main navigation tabs
    const tabs = [
      'System Categorization',
      'Controls',
      'Design Elements',
      'Requirements',
      'STIG Management',
      'Traceability Matrix',
    ];

    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab, 'i') })).toBeVisible();
    }
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on System Categorization tab
    await page.getByRole('button', { name: /System Categorization/i }).click();
    
    // Verify System Categorization content is visible
    await expect(page.getByText(/Confidentiality Impact/i)).toBeVisible();

    // Click on Controls tab
    await page.getByRole('button', { name: /^Controls$/i }).click();
    
    // Verify Controls content is visible
    await expect(page.getByText(/Control Name/i)).toBeVisible();
  });

  test('should navigate to Design Elements tab', async ({ page }) => {
    // Click on Design Elements tab
    await page.getByRole('button', { name: /Design Elements/i }).click();
    
    // Verify Design Elements form is visible
    await expect(page.getByText(/Element Name/i)).toBeVisible();
    await expect(page.getByText(/Element Type/i)).toBeVisible();
  });

  test('should navigate to STIG Management tab', async ({ page }) => {
    // Click on STIG Management tab
    await page.getByRole('button', { name: /STIG Management/i }).click();
    
    // Verify STIG Management content is visible
    await expect(page.getByText(/Import STIG/i)).toBeVisible();
  });

  test('should show Traceability Matrix', async ({ page }) => {
    // Click on Traceability Matrix tab
    await page.getByRole('button', { name: /Traceability Matrix/i }).click();
    
    // Verify Traceability Matrix is visible
    await expect(page.getByText(/Control/i)).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: /System Categorization/i })).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('button', { name: /System Categorization/i })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('button', { name: /System Categorization/i })).toBeVisible();
  });
});
