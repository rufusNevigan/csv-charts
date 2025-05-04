import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('CSV Upload', () => {
  test('should upload CSV and display chart', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Browser log:', msg.text()));

    // Navigate to the app
    await page.goto('/');

    // Find input and set files
    const fileInput = page.getByLabel('Upload CSV file');
    const filePath = path.join(__dirname, '../fixtures/sample.csv');
    console.log('Using file path:', filePath);
    await fileInput.setInputFiles(filePath);

    // Wait for file to be processed
    await page.waitForTimeout(1000);

    // Check if the file input has a value
    const fileValue = await fileInput.inputValue();
    console.log('File input value:', fileValue);

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