import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
})
