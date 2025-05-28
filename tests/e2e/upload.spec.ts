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
    
    // Wait for error message in dialog
    const errorText = await page.getByText('Failed to parse CSV file');
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
  });

  test('should handle drag and drop', async ({ page }) => {
    // Get the file drop zone
    const dropZone = page.getByTestId('file-drop-zone');
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toHaveClass(/bg-slate-50/);

    // Simulate drag enter
    await dropZone.dispatchEvent('dragover', {});
    await expect(dropZone).toHaveClass(/bg-blue-50/);
  });

  test('should handle multiple file uploads', async ({ page }) => {
    // Upload first file
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/sample.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });

    // Upload second file
    await page.getByLabel('Select CSV file').setInputFiles(path.join(dirname, '../fixtures/missing-values.csv'));
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });
    
    // Check warning message
    const warningText = await page.getByText('Warning: Some rows contain missing values');
    await expect(warningText).toBeVisible({ timeout: 10000 });
    await expect(warningText).toBeInViewport();
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
          writable: false
        });

        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, csvContent);

    // Wait for error message in dialog
    const errorText = await page.getByText(/more than 50,000 rows/);
    await expect(errorText).toBeVisible({ timeout: 10000 });
    await expect(errorText).toBeInViewport();
    await expect(page.getByText(/For performance reasons/)).toBeVisible();
  });
});
