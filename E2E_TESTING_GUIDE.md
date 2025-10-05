# E2E Testing Quick Reference

## 🎯 What is E2E Testing?

End-to-End (E2E) testing simulates real user interactions in a real browser. Unlike unit tests that test individual functions, E2E tests verify that your entire application works correctly from the user's perspective.

## 🚀 Running E2E Tests

### Basic Commands
```bash
# Run all E2E tests (headless mode)
npm run test:e2e

# Open Playwright UI (best for development)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

### First Time Running?
```bash
# Make sure your app is built
npm run build

# Or run the dev server in another terminal
npm run dev

# Then run E2E tests
npm run test:e2e:ui
```

## 📋 Test Files

### `e2e/main-app.spec.ts`
**7 tests** covering core application functionality:
- ✅ Page loads correctly
- ✅ All tabs are visible
- ✅ Can switch between tabs
- ✅ Each tab shows correct content
- ✅ Responsive design works

### `e2e/components.spec.ts`
**20+ tests** covering detailed component functionality:

**System Categorization**
- ✅ CIA impact selectors display
- ✅ Can select impact levels
- ✅ Calculates overall categorization
- ✅ Shows NIST baseline recommendation

**Design Elements**
- ✅ Form displays correctly
- ✅ Can add new elements
- ✅ Can edit existing elements
- ✅ Can delete elements

**Controls**
- ✅ Control form displays
- ✅ Can add NIST controls

**STIG Management**
- ✅ Import UI displays
- ✅ Local STIG browser works

**Traceability Matrix**
- ✅ Matrix displays
- ✅ Shows relationships
- ✅ Export functionality

## 🎨 Playwright UI Mode (Recommended)

The best way to run and debug E2E tests:

```bash
npm run test:e2e:ui
```

This opens a visual interface where you can:
- 👀 **Watch tests run** in real-time
- 🐛 **Debug failures** easily
- 📸 **See screenshots** of each step
- 🔄 **Rerun specific tests**
- 🔍 **Inspect the DOM** at each step

## 📊 Test Results

### Success Output
```
Running 27 tests using 3 workers
  ✓ main-app.spec.ts (7 tests) 
  ✓ components.spec.ts (20 tests)

  27 passed (1.2m)

To open last HTML report run:
  npx playwright show-report
```

### View HTML Report
```bash
npx playwright show-report
```

This opens a beautiful HTML report with:
- Test results
- Screenshots
- Videos (on failure)
- Traces
- Timeline

## 🔍 What E2E Tests Check

### Real User Scenarios
```typescript
// Example: User adds a design element
test('should add a new design element', async ({ page }) => {
  // 1. Navigate to Design Elements
  await page.getByRole('button', { name: /Design Elements/i }).click();
  
  // 2. Fill out the form
  await page.getByLabel(/Element Name/i).fill('Web Server');
  await page.getByLabel(/Element Type/i).selectOption('Server');
  await page.getByLabel(/Description/i).fill('Main web server');
  
  // 3. Submit the form
  await page.getByRole('button', { name: /Add/i }).click();
  
  // 4. Verify it appears
  await expect(page.getByText('Web Server')).toBeVisible();
});
```

### What Gets Tested
- ✅ **Navigation** - Can users move around the app?
- ✅ **Forms** - Can users input data?
- ✅ **Buttons** - Do clicks work?
- ✅ **Display** - Does data show correctly?
- ✅ **Responsiveness** - Mobile, tablet, desktop
- ✅ **Workflows** - Complete user journeys

## 🐛 Debugging Failed Tests

### View Trace
When a test fails, Playwright saves a trace:
```bash
npx playwright show-trace trace.zip
```

The trace shows:
- 📸 Screenshot at failure point
- 🎬 Video of the test
- 📋 Network requests
- 🖱️ User actions
- ⏱️ Timeline

### Common Issues

**Issue**: `Timeout waiting for element`
```typescript
// Solution 1: Increase timeout
await page.getByRole('button').click({ timeout: 10000 });

// Solution 2: Wait for element
await page.waitForSelector('button');
await page.getByRole('button').click();
```

**Issue**: `Element is not visible`
```typescript
// Solution: Wait for visibility
await page.getByRole('button').waitFor({ state: 'visible' });
await page.getByRole('button').click();
```

**Issue**: `Element is covered by another element`
```typescript
// Solution: Scroll into view
await page.getByRole('button').scrollIntoViewIfNeeded();
await page.getByRole('button').click();
```

## 📝 Writing New E2E Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // 1. Perform actions
    await page.getByRole('button', { name: /Click Me/i }).click();
    
    // 2. Verify results
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Finding Elements
```typescript
// By role (preferred)
page.getByRole('button', { name: /Submit/i })
page.getByRole('textbox', { name: /Name/i })
page.getByRole('heading', { name: /Title/i })

// By text
page.getByText('Hello World')
page.getByText(/hello/i)  // case insensitive

// By label
page.getByLabel('Email Address')

// By placeholder
page.getByPlaceholder('Enter your name')

// By test ID (add data-testid="..." to elements)
page.getByTestId('submit-button')
```

### Common Actions
```typescript
// Click
await page.getByRole('button').click();

// Fill text input
await page.getByLabel('Name').fill('John Doe');

// Select dropdown
await page.getByLabel('Country').selectOption('USA');

// Check checkbox
await page.getByLabel('I agree').check();

// Upload file
await page.getByLabel('Upload').setInputFiles('file.pdf');

// Hover
await page.getByRole('button').hover();

// Press key
await page.keyboard.press('Enter');
```

### Common Assertions
```typescript
// Visibility
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByText('Error')).not.toBeVisible();

// Text content
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByRole('heading')).toContainText('Wel');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// URL
await expect(page).toHaveURL(/dashboard/);

// Title
await expect(page).toHaveTitle('My App');

// Attribute
await expect(page.getByRole('button')).toHaveAttribute('disabled');
```

## 🎯 Best Practices

### 1. Use User-Centric Selectors
```typescript
// ✅ Good - how users see it
await page.getByRole('button', { name: /Submit Form/i });
await page.getByLabel('Email Address');

// ❌ Avoid - implementation details
await page.locator('.btn-primary');
await page.locator('#email-input');
```

### 2. Wait for Elements
```typescript
// ✅ Good - explicit wait
await page.getByText('Loaded').waitFor();
await page.getByRole('button').click();

// ❌ Avoid - arbitrary timeout
await page.waitForTimeout(1000);
```

### 3. Test Real User Flows
```typescript
// ✅ Good - complete workflow
test('user can create and edit element', async ({ page }) => {
  await page.getByRole('button', { name: /Add/i }).click();
  await page.getByLabel('Name').fill('Element 1');
  await page.getByRole('button', { name: /Save/i }).click();
  await page.getByRole('button', { name: /Edit/i }).click();
  await page.getByLabel('Name').fill('Element 1 Updated');
  await page.getByRole('button', { name: /Save/i }).click();
});
```

### 4. Keep Tests Independent
```typescript
// ✅ Good - each test stands alone
test.describe('Design Elements', () => {
  test.beforeEach(async ({ page }) => {
    // Reset state before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });
});
```

### 5. Use Descriptive Names
```typescript
// ✅ Good
test('should allow user to add a new design element with all fields');

// ❌ Avoid
test('test1');
```

## 🌐 Cross-Browser Testing

Your tests run on multiple browsers automatically:
- ✅ **Chromium** (Chrome, Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)

Run specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📱 Mobile Testing

Test mobile viewports:
```typescript
test('should work on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Run your test
  await expect(page.getByRole('button')).toBeVisible();
});
```

## 🎬 Screenshots & Videos

### Take Screenshots
```typescript
// In test
await page.screenshot({ path: 'screenshot.png' });

// Specific element
await page.getByRole('button').screenshot({ path: 'button.png' });
```

### Videos
Videos are automatically recorded on failure. Configure in `playwright.config.ts`:
```typescript
use: {
  video: 'on-first-retry',  // or 'on', 'off', 'retain-on-failure'
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📊 Coverage

E2E tests provide **functional coverage**, not code coverage. They verify:
- ✅ Critical user paths work
- ✅ Features integrate correctly
- ✅ UI is usable
- ✅ App works across browsers

## 🆘 Need Help?

### Playwright Documentation
- 📚 [Official Docs](https://playwright.dev)
- 🎓 [Best Practices](https://playwright.dev/docs/best-practices)
- 🔍 [Selectors Guide](https://playwright.dev/docs/selectors)

### Common Commands
```bash
# Generate tests interactively
npx playwright codegen http://localhost:3000

# Show report
npx playwright show-report

# Show trace
npx playwright show-trace trace.zip

# List available browsers
npx playwright list
```

## 🎉 Quick Win

Try this now to see E2E testing in action:
```bash
# 1. Open Playwright UI
npm run test:e2e:ui

# 2. Click on a test to run it
# 3. Watch it run in the browser panel
# 4. See the test pass with green checkmarks!
```

---

**Pro Tip**: Use `npm run test:e2e:ui` during development - it's the best way to write, run, and debug E2E tests!
