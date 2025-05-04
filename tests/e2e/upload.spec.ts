import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

test.describe('CSV Upload', () => {
  test('should upload CSV and display chart', async ({ page }) => {
    // Enable console logging for debugging purposes
    // eslint-disable-next-line no-console
    page.on('console', (msg) => console.log('[Browser]:', msg.text()));
    page.on('pageerror', (error) => console.error('[Browser Error]:', error));
    page.on('requestfailed', (request) => console.error('[Failed Request]:', request.url()));

    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
    
    // Wait for the React app to render
    await page.waitForSelector('.file-picker', { state: 'visible', timeout: 10000 });
    console.log('File picker found');

    // Debug: log the page content
    const content = await page.content();
    console.log('Page content:', content);

    // Find input and set files
    const fileInput = page.getByTestId('file-input');
    const filePath = path.join(currentDirname, '../fixtures/sample.csv');
    await fileInput.setInputFiles(filePath);

    // Wait for file to be processed
    await page.waitForTimeout(1000);

    // Wait for the chart container with increased timeout
    const chartContainer = page.getByTestId('chart-container');
    await expect(chartContainer).toBeVisible({ timeout: 10000 });

    // Add a small delay to ensure the chart has time to render
    await page.waitForTimeout(1000);

    // Wait for SVG elements to appear (indicating chart is rendered)
    await page.waitForSelector('svg', { state: 'visible', timeout: 10000 });

    // Verify basic chart structure
    const svg = page.locator('svg').first();
    await expect(svg).toBeVisible();

    // Verify we have the expected number of bars (one for each data row)
    const bars = page.locator('path').filter({ hasText: '' });
    await expect(bars).toHaveCount(4);
  });
});
