import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chart Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Upload sample CSV and wait for chart to be ready
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true');
  });

  test('should show tooltip on bar hover', async ({ page }) => {
    // Hover over the first bar
    const firstBar = page.locator('.recharts-bar-rectangle').first();
    await firstBar.hover();

    // Verify tooltip appears with correct data
    const tooltip = page.locator('.recharts-tooltip-wrapper');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('25'); // First row's age
    await expect(tooltip).toContainText('95'); // First row's score
  });

  test('should maintain chart responsiveness', async ({ page }) => {
    // Get initial chart dimensions
    const container = page.getByTestId('chart-container');
    const initialBounds = await container.boundingBox();

    // Resize viewport to simulate responsive behavior
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500); // Wait for resize to complete

    // Get new dimensions
    const newBounds = await container.boundingBox();

    // Verify chart dimensions have changed proportionally
    expect(newBounds?.width).toBeLessThan(initialBounds?.width || 0);
    expect(newBounds?.height).toBe(initialBounds?.height); // Height should remain constant
  });

  test('should update chart when switching axes', async ({ page }) => {
    // Initial state verification
    const bars = page.locator('.recharts-bar-rectangle');
    const initialCount = await bars.count();

    // Switch X and Y axes
    await page.getByLabel('X Axis').selectOption('score');
    await page.getByLabel('Y Axis').selectOption('age');

    // Verify chart updates
    await expect(page.locator('.recharts-label').filter({ hasText: 'score' })).toBeVisible();
    await expect(page.locator('.recharts-label').filter({ hasText: 'age' })).toBeVisible();

    // Verify bar count remains the same
    await expect(bars).toHaveCount(initialCount);
  });

  test('should maintain data integrity across interactions', async ({ page }) => {
    // Get initial data point values
    const initialBars = page.locator('.recharts-bar-rectangle');
    const initialCount = await initialBars.count();

    // Perform multiple interactions
    await page.getByLabel('X Axis').selectOption('score');
    await page.getByLabel('Y Axis').selectOption('age');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.getByLabel('X Axis').selectOption('age');
    await page.getByLabel('Y Axis').selectOption('score');

    // Verify data integrity
    const finalBars = page.locator('.recharts-bar-rectangle');
    await expect(finalBars).toHaveCount(initialCount);
  });

  test('should handle rapid axis changes', async ({ page }) => {
    const xAxisSelect = page.getByLabel('X Axis');
    const yAxisSelect = page.getByLabel('Y Axis');

    // Perform rapid axis changes
    const combinations = [
      { x: 'age', y: 'score' },
      { x: 'score', y: 'age' },
      { x: 'age', y: 'score' },
    ];

    await Promise.all(combinations.map(async (combination) => {
      await xAxisSelect.selectOption(combination.x);
      await yAxisSelect.selectOption(combination.y);
    }));

    // Verify chart is still properly rendered
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
  });
});
