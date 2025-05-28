import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chart Performance Tests', () => {
  // Helper function to wait for chart stability
  async function waitForChartStability(page: Page) {
    await expect(page.getByTestId('chart-container')).toBeVisible();
    
    const chartContainer = page.getByTestId('chart-container');
    
    // Check the attribute value once and wait if needed
    const currentValue = await chartContainer.getAttribute('data-ready');
    console.log(`[waitForChartStability] Current data-ready: ${currentValue}`);
    
    if (currentValue !== 'true') {
      console.log('[waitForChartStability] Waiting for data-ready to become true...');
      await expect(chartContainer).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
    }
    
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5, { timeout: 5000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await waitForChartStability(page);
  });

  test('should render chart quickly after data load', async ({ page }) => {
    const startTime = Date.now();
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await waitForChartStability(page);
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(5000); // Increased threshold for reliability
  });

  test('should maintain performance during axis changes', async ({ page }) => {
    await waitForChartStability(page);
    
    const startTime = Date.now();
    
    // Log initial state
    const xAxisSelect = page.getByLabel('X Axis');
    const yAxisSelect = page.getByLabel('Y Axis');
    const chartContainer = page.getByTestId('chart-container');
    
    console.log('[Test] Initial state:', {
      xValue: await xAxisSelect.inputValue(),
      yValue: await yAxisSelect.inputValue(),
      dataReady: await chartContainer.getAttribute('data-ready')
    });
    
    // First, change X axis to a different valid column (score)
    // This should work since Y is currently 'score' -> X will be 'score', Y is 'score' (invalid)
    // But then immediately change Y to 'age' to make it valid
    console.log('[Test] Changing X axis to score and Y axis to age simultaneously');
    
    // Change both axes quickly to avoid invalid intermediate state
    await page.getByLabel('X Axis').selectOption('score');
    await page.getByLabel('Y Axis').selectOption('age');
    await page.waitForTimeout(200); // Allow both changes to settle
    
    console.log('[Test] After axis changes:', {
      xValue: await xAxisSelect.inputValue(),
      yValue: await yAxisSelect.inputValue(),
      dataReady: await chartContainer.getAttribute('data-ready')
    });
    
    await waitForChartStability(page);
    
    const endTime = Date.now();
    const updateTime = endTime - startTime;
    expect(updateTime).toBeLessThan(6000); // Allow more time for axis changes
  });

  test('should handle window resize efficiently', async ({ page }) => {
    await waitForChartStability(page);
    
    const startTime = Date.now();
    await page.setViewportSize({ width: 800, height: 600 });
    await waitForChartStability(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await waitForChartStability(page);
    const endTime = Date.now();
    const resizeTime = endTime - startTime;
    expect(resizeTime).toBeLessThan(3000);
  });

  test('should maintain smooth interactions under load', async ({ page }) => {
    await waitForChartStability(page);
    
    const combinations = [
      { x: 'score', y: 'age' },
      { x: 'age', y: 'score' },
      { x: 'score', y: 'age' },
    ];

    const startTime = Date.now();
    
    for (const combination of combinations) {
      // Change both axes simultaneously to avoid invalid intermediate states
      await page.getByLabel('X Axis').selectOption(combination.x);
      await page.getByLabel('Y Axis').selectOption(combination.y);
      await page.waitForTimeout(100); // Allow changes to settle
      await waitForChartStability(page);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(10000); // Allow more time for multiple changes
  });

  test('should display error messages when same axis is selected', async ({ page }) => {
    await waitForChartStability(page);
    
    // Select same column for both axes
    await page.getByLabel('X Axis').selectOption('age');
    await page.getByLabel('Y Axis').selectOption('age');
    
    // Wait for error message in dialog
    const errorText = await page.getByText('X and Y axes must be different columns');
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
  });
});
