import { test, expect } from '@playwright/test';

test.describe('System Categorization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to System Categorization tab
    await page.getByRole('button', { name: /System Categorization/i }).click();
  });

  test('should display CIA impact selectors', async ({ page }) => {
    // Check for Confidentiality
    await expect(page.getByText(/Confidentiality Impact/i)).toBeVisible();
    
    // Check for Integrity
    await expect(page.getByText(/Integrity Impact/i)).toBeVisible();
    
    // Check for Availability
    await expect(page.getByText(/Availability Impact/i)).toBeVisible();
  });

  test('should allow selecting impact levels', async ({ page }) => {
    // Find and click a Confidentiality impact level
    const confidentialitySection = page.locator('text=Confidentiality Impact').locator('..');
    await confidentialitySection.getByRole('button', { name: /Low/i }).click();
    
    // Verify it's selected (you may need to adjust based on actual UI)
    await expect(confidentialitySection.getByRole('button', { name: /Low/i })).toHaveClass(/selected|active|bg-/);
  });

  test('should calculate overall system categorization', async ({ page }) => {
    // Select impact levels
    const confidentialitySection = page.locator('text=Confidentiality Impact').locator('..');
    await confidentialitySection.getByRole('button', { name: /Moderate/i }).click();
    
    const integritySection = page.locator('text=Integrity Impact').locator('..');
    await integritySection.getByRole('button', { name: /High/i }).click();
    
    const availabilitySection = page.locator('text=Availability Impact').locator('..');
    await availabilitySection.getByRole('button', { name: /Low/i }).click();
    
    // Check that overall categorization is displayed (High is the highest)
    await expect(page.getByText(/Overall.*High/i)).toBeVisible();
  });

  test('should show appropriate NIST baseline', async ({ page }) => {
    // Select High impact
    const confidentialitySection = page.locator('text=Confidentiality Impact').locator('..');
    await confidentialitySection.getByRole('button', { name: /High/i }).click();
    
    // Should show High baseline recommendation
    await expect(page.getByText(/High Baseline/i)).toBeVisible();
  });
});

test.describe('Design Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Design Elements/i }).click();
  });

  test('should display design element form', async ({ page }) => {
    await expect(page.getByText(/Element Name/i)).toBeVisible();
    await expect(page.getByText(/Element Type/i)).toBeVisible();
    await expect(page.getByText(/Description/i)).toBeVisible();
  });

  test('should add a new design element', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/Element Name/i).fill('Test Web Server');
    
    // Select element type
    await page.getByLabel(/Element Type/i).selectOption('Web Server');
    
    // Fill description
    await page.getByLabel(/Description/i).fill('Test web server for E2E testing');
    
    // Click Add button
    await page.getByRole('button', { name: /Add Design Element/i }).click();
    
    // Verify element appears in the list
    await expect(page.getByText('Test Web Server')).toBeVisible();
  });

  test('should edit a design element', async ({ page }) => {
    // First add an element
    await page.getByLabel(/Element Name/i).fill('Edit Test Element');
    await page.getByLabel(/Element Type/i).selectOption('Database');
    await page.getByRole('button', { name: /Add Design Element/i }).click();
    
    // Click edit button for the element
    await page.getByRole('button', { name: /Edit.*Edit Test Element/i }).click();
    
    // Modify the name
    await page.getByLabel(/Element Name/i).fill('Modified Element Name');
    
    // Save changes
    await page.getByRole('button', { name: /Update/i }).click();
    
    // Verify updated name
    await expect(page.getByText('Modified Element Name')).toBeVisible();
  });

  test('should delete a design element', async ({ page }) => {
    // Add an element
    await page.getByLabel(/Element Name/i).fill('Delete Test Element');
    await page.getByLabel(/Element Type/i).selectOption('Firewall');
    await page.getByRole('button', { name: /Add Design Element/i }).click();
    
    // Click delete button
    await page.getByRole('button', { name: /Delete.*Delete Test Element/i }).click();
    
    // Confirm deletion if there's a confirmation dialog
    // await page.getByRole('button', { name: /Confirm|Yes|Delete/i }).click();
    
    // Verify element is removed
    await expect(page.getByText('Delete Test Element')).not.toBeVisible();
  });
});

test.describe('Controls Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /^Controls$/i }).click();
  });

  test('should display control form', async ({ page }) => {
    await expect(page.getByText(/Control Name/i)).toBeVisible();
  });

  test('should add a NIST control', async ({ page }) => {
    // Fill control identifier
    await page.getByLabel(/Control.*Identifier/i).fill('AC-1');
    
    // Fill control name
    await page.getByLabel(/Control Name/i).fill('Access Control Policy and Procedures');
    
    // Select baseline
    await page.getByLabel(/Baseline/i).selectOption('Low');
    
    // Add control
    await page.getByRole('button', { name: /Add Control/i }).click();
    
    // Verify control appears
    await expect(page.getByText('AC-1')).toBeVisible();
  });
});

test.describe('STIG Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /STIG Management/i }).click();
  });

  test('should display STIG import options', async ({ page }) => {
    await expect(page.getByText(/Import STIG/i)).toBeVisible();
  });

  test('should show local STIG browser', async ({ page }) => {
    // Look for browse local STIGs button or section
    const browseButton = page.getByRole('button', { name: /Browse.*Local.*STIG/i });
    if (await browseButton.isVisible()) {
      await browseButton.click();
      // Verify browser opens
      await expect(page.getByText(/Local STIGs/i)).toBeVisible();
    }
  });
});

test.describe('Traceability Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Traceability Matrix/i }).click();
  });

  test('should display traceability matrix table', async ({ page }) => {
    // Check for table headers
    await expect(page.getByText(/Control/i).first()).toBeVisible();
  });

  test('should show relationships between controls and elements', async ({ page }) => {
    // First add a control and design element
    await page.getByRole('button', { name: /^Controls$/i }).click();
    await page.getByLabel(/Control.*Identifier/i).fill('AC-2');
    await page.getByRole('button', { name: /Add Control/i }).click();
    
    // Add a design element
    await page.getByRole('button', { name: /Design Elements/i }).click();
    await page.getByLabel(/Element Name/i).fill('Authentication Server');
    await page.getByLabel(/Element Type/i).selectOption('Authentication System');
    await page.getByRole('button', { name: /Add Design Element/i }).click();
    
    // Go to traceability matrix
    await page.getByRole('button', { name: /Traceability Matrix/i }).click();
    
    // Verify both appear in the matrix
    await expect(page.getByText('AC-2')).toBeVisible();
    await expect(page.getByText('Authentication Server')).toBeVisible();
  });

  test('should export matrix', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByRole('button', { name: /Export|Download/i });
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      // Verify download started
      expect(download).toBeTruthy();
    }
  });
});
