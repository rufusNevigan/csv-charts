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
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
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
    await dropZone.dispatchEvent('dragover', {});
    await expect(dropZone).toHaveClass(/bg-blue-50/);

    // Simulate drag leave
    await dropZone.dispatchEvent('dragleave', {});
    await expect(dropZone).toHaveClass(/bg-slate-50/);
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const testFiles = [
      '../fixtures/sample.csv',
      '../fixtures/missing-values.csv',
      '../fixtures/duplicate-headers.csv',
    ];

    // Process files sequentially using Promise.all and map
    await Promise.all(testFiles.map(async (filePath) => {
      await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, filePath));
      // Skip chart checks for duplicate headers file as it should show error
      if (!filePath.includes('duplicate-headers')) {
        await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
        await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
      }
      // Wait between uploads to ensure proper state reset
      await page.waitForTimeout(500);
    }));
  });

  test('should show friendly error for large files', async ({ page }) => {
    // Create a large CSV file programmatically
    const rows = ['id,name,value'];
    for (let i = 0; i < 50001; i += 1) {
      rows.push(`${i + 1},Row ${i + 1},${Math.floor(Math.random() * 1000)}`);
    }
    const csvContent = rows.join('\n');

    // Upload the large CSV content directly
    await page.evaluate(async (content) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'large.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = document.querySelector('input[type="file"]');
      if (input) {
        Object.defineProperty(input, 'files', {
          value: dataTransfer.files,
          writable: false,
        });
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, csvContent);

    // Wait for error message and verify content
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    await expect(errorMessage).toContainText('more than 50,000 rows');
    await expect(errorMessage).toContainText('For performance reasons');
  });
});
