import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('File Upload Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show file picker on page load', async ({ page }) => {
    const filePicker = page.getByLabel('Select CSV file');
    await expect(filePicker).toBeVisible();
  });

  test('should accept CSV file upload', async ({ page }) => {
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible();
  });

  test('should reject non-CSV file', async ({ page }) => {
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/invalid.txt'));
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('Failed to parse CSV file');
  });

  test('should handle drag and drop', async ({ page }) => {
    // Verify drag-drop styling
    const dropZone = page.getByTestId('file-drop-zone');
    await expect(dropZone).toHaveClass(/bg-slate-50/);

    // Simulate drag enter
    await dropZone.hover();
    await page.mouse.down();
    await expect(dropZone).toHaveClass(/bg-blue-50/);

    // Simulate drag leave
    await page.mouse.up();
    await expect(dropZone).toHaveClass(/bg-slate-50/);
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const testFiles = [
      '../fixtures/sample.csv',
      '../fixtures/missing-values.csv',
      '../fixtures/duplicate-headers.csv',
    ];

    // Process files sequentially using reduce
    await testFiles.reduce(async (promise, filePath) => {
      await promise;
      await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, filePath));
      await expect(page.getByTestId('chart-container')).toBeVisible();
      await page.waitForTimeout(500);
    }, Promise.resolve());
  });
});
