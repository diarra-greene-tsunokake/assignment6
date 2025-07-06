import { defineConfig } from 'vitest/config'
import vitestOpenapiPlugin from './vitest-openapi-plugin'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      adapter: path.resolve(__dirname, '../adapter')
    }
  },
  test: {
    includeSource: ['src/**/*.{js,ts}'],
    setupFiles: ['./database_test_setup.ts'],
    globalSetup: ['./global_database_install.ts'],
    watchExclude: ['build/**', 'client/**']
  },
  plugins: [
    vitestOpenapiPlugin
  ]
})
