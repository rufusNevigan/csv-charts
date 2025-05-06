import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('CSV Upload and Chart Display', () => {
  test('should upload CSV and display chart with correct data', async ({ page }) => {
    // Start the dev server and visit the page
    await page.goto('/');

    // Find and verify the file picker exists
    const filePicker = page.getByLabel('Upload CSV file');
    await expect(filePicker).toBeVisible();

    // Upload the sample CSV file
    await filePicker.setInputFiles(path.join(dirname, '../fixtures/sample.csv'));

    // Wait for the chart container to appear and be visible
    const chartContainer = page.getByTestId('chart-container');
    await expect(chartContainer).toBeVisible();

    // Wait for the chart to be fully rendered by checking for specific elements
    // First, wait for the chart container to be ready
    await expect(chartContainer).toHaveAttribute('data-ready', 'true');

    // Wait for and verify the chart axes are present
    const xAxis = page.locator('.recharts-xAxis');
    const yAxis = page.locator('.recharts-yAxis');
    await expect(xAxis).toBeVisible();
    await expect(yAxis).toBeVisible();

    // Verify the chart displays the correct numeric columns using more specific selectors
    const xAxisLabel = xAxis.locator('.recharts-label').filter({ hasText: 'age' });
    const yAxisLabel = yAxis.locator('.recharts-label').filter({ hasText: 'score' });
    await expect(xAxisLabel).toBeVisible();
    await expect(yAxisLabel).toBeVisible();

    // Wait for and verify the bars are rendered
    // In Recharts, the actual visible bars are path elements inside the bar rectangles
    const barPaths = page.locator('.recharts-bar-rectangle path');
    await expect(barPaths).toHaveCount(5); // One bar for each row in sample.csv

    // Verify each bar path is visible and has the correct attributes
    const paths = await barPaths.all();
    for (const path of paths) {
      await expect(path).toBeVisible();
      // Check for the d attribute which defines the path shape
      await expect(path).toHaveAttribute('d');
      // Check for fill color
      await expect(path).toHaveAttribute('fill', '#3b82f6');
    }
  });
});
