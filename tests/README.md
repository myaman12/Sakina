# Sakina v2.8 Test Suite

## Setup

To run these tests, you need to install a test framework. We recommend Vitest:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitest/ui
```

## Configuration

Add the following to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Create a `vitest.config.ts` file in the project root:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

Create `tests/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Test Coverage

### Audio Priority Tests (`audioPriority.test.ts`)

Tests the core audio selection logic to ensure:

1. **Adhan Priority Dominance**
   - Sheikh Qassas (Audio.com) is always the top priority
   - Alternates correctly between Qassas variants
   - Respects priority order when top choice is playing
   - Never mixes modes (Adhan stays Adhan)

2. **Dua Sequential Logic**
   - Sekine Duası → Cevşen-ül Kebir sequence works correctly
   - Filters out Quran content from Dua mode
   - Starts with Sekine when entering Dua mode

3. **Mode Specific Behavior**
   - Each mode returns only its own content type
   - Never returns currently playing audio
   - Handles edge cases gracefully

4. **History & Variety**
   - Avoids recently played tracks
   - Handles exhausted history without errors

5. **Asset Validation**
   - Verifies all required assets exist
   - Confirms library expansion (instrumentals, etc.)

## Expected Results

All tests should pass after the v2.8 updates:
- ✅ Adhan priority logic with Qassas dominance
- ✅ Sekine → Cevşen sequential flow
- ✅ Mode isolation (no cross-contamination)
- ✅ Expanded instrumental library (7+ tracks)
- ✅ Proper asset filtering and validation
