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
    page.on('console', msg => messages.push(msg.text()));

    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/invalid.txt'));
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('error-message')).toContainText('Failed to parse CSV file');

    console.log('Console messages:', messages);
  });

  test('should handle missing values in CSV', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/missing-values.csv'));
    await expect(page.getByTestId('warning-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('warning-message')).toContainText('Warning: Some rows contain missing values');
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);

    console.log('Console messages:', messages);
  });

  test('should handle duplicate headers in CSV', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/duplicate-headers.csv'));

    // Verify error message
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('error-message')).toContainText('Duplicate headers found: name, name');

    // Log console messages for debugging
    console.log('Console messages:', messages);
  });

  test('should validate column selection', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();

    // Select same column for both axes
    await page.getByLabel('X Axis').selectOption('age');
    await page.getByLabel('Y Axis').selectOption('age');

    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('error-message')).toContainText('X and Y axes must be different columns');

    console.log('Console messages:', messages);
  });

  test('should reset state when new file is uploaded', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));

    // Upload first file
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);

    // Upload second file
    await page.getByLabel('Upload CSV file').setInputFiles(path.join(currentDirname, '../fixtures/missing-values.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(5);
    await expect(page.getByTestId('warning-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('warning-message')).toContainText('Warning: Some rows contain missing values');

    console.log('Console messages:', messages);
  });
}); 