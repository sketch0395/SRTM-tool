# Quick Test Reference Card

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Watch mode (auto-rerun)
npm run test:watch

# With coverage
npm run test:coverage
```

## ✅ Test Status

```
✅ 30/30 tests passing
✅ 0 failures
✅ Time: 0.456s
✅ Coverage: 28.72% of stigFamilyRecommendations.ts
```

## 📁 Files

```
utils/stigFamilyRecommendations.test.ts  - Test suite
jest.config.js                           - Jest config
jest.setup.js                            - Global setup
TEST_README.md                           - Full docs
UNIT_TEST_SUMMARY.md                     - Detailed results
```

## 🧪 Test Coverage

### What's Tested ✅
- Database status & health score
- STIG update application
- Rollback functionality
- Backup management
- Import/export
- Auto-update config
- Pending updates
- Edge cases
- Data validation

### Not Yet Tested ❌
- Async update checking (needs mocks)
- External API calls (needs mocks)
- Scheduled updates (needs mocks)
- Recommendation engine (complex)
- React components (needs React testing)

## 📊 Key Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Tests | 30 | ✅ |
| Passing | 30 | ✅ |
| Failing | 0 | ✅ |
| Coverage | 28.72% | 80% ⚠️ |
| Speed | 0.456s | <1s ✅ |

## 🎯 Test Suites

1. **Database Status** (4 tests)
2. **Update Application** (4 tests)
3. **Rollback** (3 tests)
4. **Backup Management** (3 tests)
5. **Import/Export** (5 tests)
6. **Auto-Update Config** (2 tests)
7. **Pending Updates** (2 tests)
8. **Edge Cases** (4 tests)
9. **Data Validation** (3 tests)

## 🔧 Common Commands

```bash
# Run specific test
npm test -- -t "health score"

# Run specific suite
npm test -- -t "STIG Database Status"

# Verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u

# Debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 💡 Tips

- Tests run on every file save in watch mode
- Coverage report in `coverage/` folder
- Mock console output to reduce noise
- Tests are independent (no pollution)
- Use `clearAllBackups()` for clean state

## 🐛 Troubleshooting

### "Cannot find module"
Check `jest.config.js` module mapper

### "localStorage is not defined"
Mock provided in `jest.setup.js`

### "Tests timing out"
Add `jest.setTimeout(10000)` in test

### Tests failing randomly
Check for state pollution, add cleanup

## 📈 Next Steps

1. ⬜ Add async function tests
2. ⬜ Increase coverage to 50%
3. ⬜ Add component tests
4. ⬜ Add integration tests
5. ⬜ Set up CI/CD

---

**Status**: ✅ All tests passing  
**Updated**: October 2, 2025  
**Coverage**: 28.72% → Target 80%+
