import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chart Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
  });

  test('should render chart quickly after data load', async ({ page }) => {
    const startTime = Date.now();
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(2000); // Chart should render within 2 seconds
  });

  test('should maintain performance during axis changes', async ({ page }) => {
    const startTime = Date.now();
    await page.getByLabel('X Axis').selectOption('score');
    await page.getByLabel('Y Axis').selectOption('age');
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
    const endTime = Date.now();
    const updateTime = endTime - startTime;
    expect(updateTime).toBeLessThan(1000); // Axis changes should be quick
  });

  test('should handle window resize efficiently', async ({ page }) => {
    const startTime = Date.now();
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(100);
    await expect(page.getByTestId('chart-container')).toBeVisible();
    const endTime = Date.now();
    const resizeTime = endTime - startTime;
    expect(resizeTime).toBeLessThan(1000); // Resize should be smooth
  });

  test('should maintain smooth interactions under load', async ({ page }) => {
    const combinations = [
      { x: 'age', y: 'score' },
      { x: 'score', y: 'age' },
      { x: 'age', y: 'score' },
    ];

    const startTime = Date.now();
    await Promise.all(combinations.map(async (combination) => {
      await page.getByLabel('X Axis').selectOption(combination.x);
      await page.getByLabel('Y Axis').selectOption(combination.y);
      await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
    }));
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(3000); // Multiple changes should complete within 3 seconds
  });
});
