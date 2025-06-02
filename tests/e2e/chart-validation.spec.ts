import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Chart Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should handle non-CSV file upload', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/invalid.txt'));

    // Wait for error message in dialog
    const errorText = await page.getByText('Failed to parse CSV file');
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
  });

  test('should handle missing values in CSV', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/missing-values.csv'));

    // Wait for warning message
    const warningText = await page.getByText('Warning: Some rows contain missing values');
    await expect(warningText).toBeVisible({ timeout: 10000 });
    await expect(warningText).toBeInViewport();

    // Wait for chart to be ready
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5, { timeout: 10000 });
  });

  test('should handle duplicate headers in CSV', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/duplicate-headers.csv'));

    // Wait for error message in dialog
    const errorText = await page.getByText('Duplicate headers found: name, name');
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
  });

  test('should validate column selection', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });

    // Select same column for both axes
    await page.getByLabel('X Axis').selectOption('age');
    await page.getByLabel('Y Axis').selectOption('age');

    // Wait for error message in dialog
    const errorText = await page.getByText('X and Y axes must be different columns');
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
  });

  test('should reset state when new file is uploaded', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    // Upload first file
    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5, { timeout: 10000 });

    // Upload second file
    await page.getByLabel('Select CSV file').setInputFiles(path.join(currentDirname, '../fixtures/missing-values.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5, { timeout: 10000 });

    // Check warning message
    const warningText = await page.getByText('Warning: Some rows contain missing values');
    await expect(warningText).toBeVisible({ timeout: 10000 });
    await expect(warningText).toBeInViewport();
  });
});
