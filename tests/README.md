# Tests Overview

This folder contains all unit, integration, and functional tests covering 15 User Stories across 5 Epics.

## Test Structure

```
tests/
├── userStories.test.mjs                    # Metadata validation (16 tests)
├── integration/
│   ├── epic1-form-validation.test.mjs     # Epic 1: Form (22 tests)
│   ├── epic2-simple-query.test.mjs        # Epic 2: Simple Query (10 tests)
│   ├── epic3-complex-referral.test.mjs    # Epic 3: Complex (9 tests)
│   ├── epic4-data-reporting.test.mjs      # Epic 4: Reporting (20 tests)
│   └── epic5-question-edit.test.mjs       # Epic 5: Edit (14 tests)
└── functional/
    └── end-to-end-workflow.test.mjs       # E2E workflows (4 tests)
```

**Total:** 95 tests covering all 15 User Stories

## Quick Start

### Run All Tests
```bash
npm test                    # All tests (95 tests)
```

### Run by Test Type
```bash
npm run test:unit           # Metadata validation (16 tests)
npm run test:integration    # Integration tests (75 tests)
npm run test:functional     # End-to-end workflows (4 tests)
```

### Run by Epic
```bash
npm run test:epic1          # Epic 1: Information Form (22 tests)
npm run test:epic2          # Epic 2: Simple Query (10 tests)
npm run test:epic3          # Epic 3: Complex Referral (9 tests)
npm run test:epic4          # Epic 4: Data Reporting (20 tests)
npm run test:epic5          # Epic 5: Question Edit (14 tests)
```

### Watch Mode
```bash
npm run test:watch          # Run tests in watch mode
