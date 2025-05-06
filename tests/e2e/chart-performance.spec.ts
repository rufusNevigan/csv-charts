import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chart Performance and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Generate a large CSV with 1000 rows
    const rows = Array.from({ length: 1000 }, (_, i) => `Row${i},${i},${Math.random() * 100}`);
    const csvContent = `name,age,score\n${rows.join('\n')}`;

    // Upload large CSV
    await page.getByLabel('Upload CSV file').setInputFiles({
      name: 'large-dataset.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Verify chart renders within acceptable time
    const startTime = Date.now();
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true');
    const renderTime = Date.now() - startTime;
    
    // Chart should render in less than 5 seconds
    expect(renderTime).toBeLessThan(5000);

    // Verify all bars are rendered
    const bars = page.locator('.recharts-bar-rectangle');
    await expect(bars).toHaveCount(1000);
  });

  test('should handle special characters in column names', async ({ page }) => {
    // Create CSV with special characters in headers
    const csvContent = 'Name (First),Age %,Score #\nAlice,25,95\nBob,30,88';
    
    await page.getByLabel('Upload CSV file').setInputFiles({
      name: 'special-chars.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Verify column names are displayed correctly
    await expect(page.getByLabel('X Axis')).toContainText('Age %');
    await expect(page.getByLabel('Y Axis')).toContainText('Score #');
  });

  test('should handle window focus/blur events', async ({ page }) => {
    // Upload sample CSV
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();

    // Simulate tab switching
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));

    // Verify chart is still rendered correctly
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
  });

  test('should handle rapid window resizing', async ({ page }) => {
    // Upload sample CSV
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();

    // Perform multiple rapid viewport size changes
    const viewportSizes = [
      { width: 1024, height: 768 },
      { width: 800, height: 600 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    ];

    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(100); // Brief pause between resizes
    }

    // Verify chart is still rendered correctly
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
    await expect(page.getByTestId('chart-container')).toBeVisible();
  });

  test('should handle non-ASCII characters in data', async ({ page }) => {
    // Create CSV with non-ASCII characters
    const csvContent = 'name,age,score\n名前,25,95\nJosé,30,88\nمحمد,35,92';
    
    await page.getByLabel('Upload CSV file').setInputFiles({
      name: 'unicode.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    // Verify data is displayed correctly
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(3);
  });
}); 