# STIG Update System Unit Tests

## Overview

This test suite provides comprehensive unit testing for the STIG Family Recommendations and Auto-Update System. It validates the core functionality of STIG database management, update detection, application, and rollback operations.

## Test Coverage

### 1. **Database Status Tests** (`getStigDatabaseStatus`)
- ✅ Validates health metrics calculation
- ✅ Tests 100% health score with all STIGs validated
- ✅ Tests health score decrease with unvalidated STIGs
- ✅ Tests health score decrease with outdated STIGs
- ✅ Verifies metadata tracking (last updated, validated, review due dates)

### 2. **STIG Update Application Tests** (`applyStigUpdate`)
- ✅ Successfully applies updates to existing STIGs
- ✅ Handles non-existent STIG IDs gracefully
- ✅ Creates automatic backups before applying updates
- ✅ Updates STIG version, release date, and validation status
- ✅ Handles updates without new version data (date-based warnings)

### 3. **Batch Update Tests** (`applyMultipleStigUpdates`)
- ✅ Processes multiple STIG updates in one operation
- ✅ Handles empty update arrays
- ✅ Returns success/failure results for each update
- ✅ Tracks success and failure counts

### 4. **Rollback Functionality Tests** (`rollbackStigUpdate`)
- ✅ Successfully restores previous STIG versions
- ✅ Handles rollback when no backup exists
- ✅ Fails gracefully for non-existent STIGs
- ✅ Supports multiple consecutive rollbacks
- ✅ Prevents rollback when backup stack is empty

### 5. **Backup Management Tests**
- ✅ `getAvailableBackups` - Lists all available backup versions
- ✅ `clearAllBackups` - Removes all stored backups
- ✅ Tracks multiple backups per STIG
- ✅ Maintains backup version history

### 6. **Import/Export Tests**
- ✅ `exportStigDatabase` - Generates valid JSON backup
- ✅ `importStigDatabase` - Restores from valid backup
- ✅ Rejects invalid JSON data
- ✅ Validates backup format before importing
- ✅ Preserves data integrity across export/import cycle
- ✅ Creates pre-import backup for safety

### 7. **Auto-Update Configuration Tests**
- ✅ `setAutoUpdateEnabled` - Toggles auto-updates on/off
- ✅ Validates `AUTO_UPDATE_CONFIG` structure
- ✅ Tests configuration properties (enabled, frequency, sources, etc.)
- ✅ Verifies auto-apply preferences

### 8. **Pending Updates Tests** (`getPendingUpdates`)
- ✅ Returns array of pending updates
- ✅ Validates update structure (stigId, source, severity, etc.)

### 9. **Edge Cases & Error Handling**
- ✅ Handles empty STIG array gracefully
- ✅ Validates date formats (ISO 8601)
- ✅ Tests STIG family data structure
- ✅ Verifies metadata dates are valid
- ✅ Ensures requirement counts are numbers
- ✅ Validates boolean flags

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test stigFamilyRecommendations.test.ts
```

### Run Specific Test Suite
```bash
npm test -- -t "STIG Database Status"
```

### Run Specific Test
```bash
npm test -- -t "should return valid health metrics"
```

## Test Structure

```typescript
describe('Test Suite Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should do something', () => {
    // Arrange
    const mockData = { ... };
    
    // Act
    const result = functionUnderTest(mockData);
    
    // Assert
    expect(result).toBe(expectedValue);
  });

  afterEach(() => {
    // Cleanup after each test
  });
});
```

## Key Testing Patterns

### 1. **State Preservation**
Tests that modify STIG data use try/finally blocks to restore original state:
```typescript
const originalFamilies = STIG_FAMILIES.map(f => ({ ...f }));
try {
  // Test modifications
  STIG_FAMILIES[0].validated = false;
  // ... test assertions
} finally {
  // Restore original state
  STIG_FAMILIES.length = 0;
  STIG_FAMILIES.push(...originalFamilies);
}
```

### 2. **Backup Management**
Tests clear backups before running to ensure clean state:
```typescript
beforeEach(() => {
  clearAllBackups();
});
```

### 3. **Console Mocking**
Console output is mocked to reduce test noise:
```typescript
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
```

## Mock Data Examples

### StigUpdateCheck Mock
```typescript
const mockUpdate: StigUpdateCheck = {
  stigId: 'application-security-dev',
  currentVersion: 'V5',
  latestVersion: 'V6',
  currentReleaseDate: '2024-01-01',
  latestReleaseDate: '2025-02-12',
  updateAvailable: true,
  source: 'stigviewer.com',
  severity: 'high',
  lastChecked: '2025-10-02'
};
```

## Coverage Goals

- **Line Coverage**: Target 80%+
- **Function Coverage**: Target 90%+
- **Branch Coverage**: Target 75%+
- **Statement Coverage**: Target 80%+

## Current Test Statistics

- **Total Test Suites**: 9
- **Total Tests**: 40+
- **Functions Tested**: 15+
- **Edge Cases Covered**: 10+

## What's Tested

### Core Functions
- ✅ `getStigDatabaseStatus()`
- ✅ `applyStigUpdate()`
- ✅ `applyMultipleStigUpdates()`
- ✅ `rollbackStigUpdate()`
- ✅ `getAvailableBackups()`
- ✅ `clearAllBackups()`
- ✅ `exportStigDatabase()`
- ✅ `importStigDatabase()`
- ✅ `getPendingUpdates()`
- ✅ `setAutoUpdateEnabled()`

### Data Structures
- ✅ `STIG_FAMILIES` array validation
- ✅ `STIG_DATABASE_METADATA` structure
- ✅ `AUTO_UPDATE_CONFIG` configuration
- ✅ `StigUpdateCheck` interface
- ✅ Date format validation

### Business Logic
- ✅ Health score calculation (0-100 scale)
- ✅ Validation percentage tracking
- ✅ Outdated STIG detection
- ✅ Backup versioning
- ✅ Update application workflow

## Integration with CI/CD

Add to your CI/CD pipeline:
```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Run Tests with Node Debugger
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Console Output
Uncomment console mocking in test file to see actual console output during tests.

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution**: Ensure `jest.config.js` has correct module mapper for path aliases

### Issue: "localStorage is not defined"
**Solution**: Mock is provided in `jest.setup.js`

### Issue: "Tests timing out"
**Solution**: Increase timeout with `jest.setTimeout(10000)` in test file

### Issue: "Module not found: Can't resolve '../types/srtm'"
**Solution**: Check TypeScript paths in `tsconfig.json` match Jest module mapper

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean State**: Use beforeEach/afterEach to reset state
3. **Mock External Deps**: Mock fetch, localStorage, etc.
4. **Test Edge Cases**: Empty arrays, null values, invalid data
5. **Descriptive Names**: Use clear test names that describe behavior
6. **Arrange-Act-Assert**: Follow AAA pattern for clarity
7. **Single Assertion**: Prefer one logical assertion per test
8. **Fast Tests**: Keep tests under 1 second each

## Future Enhancements

- [ ] Add integration tests for API routes
- [ ] Add component tests for React components
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add performance benchmarking tests
- [ ] Add snapshot testing for UI components
- [ ] Add mutation testing for coverage quality
- [ ] Add contract testing for external APIs

## Contributing

When adding new functions to `stigFamilyRecommendations.ts`:

1. Write tests first (TDD approach)
2. Ensure tests cover happy path + error cases
3. Update this README with new test coverage
4. Run full test suite before committing
5. Maintain 80%+ coverage target

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Unit Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Last Updated**: October 2, 2025  
**Test Framework**: Jest v30.2.0  
**TypeScript**: v5.x  
**Node**: v18+
