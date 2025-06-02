import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

let server: ChildProcess;
let PORT: number;
let BASE_URL: string;

test.describe.configure({ mode: 'serial' });

test.describe('Production Build', () => {
  test.beforeAll(async () => {
    // Use a random port to avoid conflicts
    PORT = 4000 + Math.floor(Math.random() * 1000);
    BASE_URL = `http://localhost:${PORT}`;

    // Ensure dist folder exists
    const distPath = path.resolve('dist');
    try {
      await fs.access(distPath);
    } catch {
      throw new Error('dist folder not found. Please run "npm run build" first.');
    }

    // Start vite preview server for production build
    server = spawn('npx', ['vite', 'preview', '--port', PORT.toString(), '--host'], {
      stdio: 'pipe',
    });

    // Wait for server to start (simplified approach)
    await new Promise((resolve) => { setTimeout(resolve, 3000); });

    // Test if server is responding
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Server not responding: ${response.status}`);
      }
    } catch (error) {
      server.kill();
      throw new Error(`Failed to start server on port ${PORT}: ${error}`);
    }
  });

  test.afterAll(async () => {
    if (server) {
      server.kill();
    }
  });

  test('loads home page correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check that the page loads
    await expect(page).toHaveTitle(/CSV Charts/);

    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('CSV Charts');
  });

  test('can upload CSV and render chart', async ({ page }) => {
    await page.goto(BASE_URL);

    // Create a simple CSV content with proper numeric values
    const csvContent = 'name,age,score\nAlice,25,95\nBob,30,88\nCharlie,35,92';

    // Upload the CSV content using the same approach as existing tests
    await page.evaluate(async (content) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });
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

    // Wait for chart container to be ready
    await expect(page.getByTestId('chart-container')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chart-container')).toHaveAttribute('data-ready', 'true', { timeout: 10000 });

    // Check that SVG chart is rendered
    await expect(page.locator('svg')).toBeVisible({ timeout: 5000 });
  });

  test('bundle analysis file exists', async () => {
    const analysisPath = path.resolve('dist/bundle-analysis.html');

    try {
      await fs.access(analysisPath);
      const stats = await fs.stat(analysisPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(1000); // Should be a substantial file
    } catch (error) {
      throw new Error('Bundle analysis file not found. Make sure build process completed successfully.');
    }
  });

  test('static assets are properly generated', async () => {
    const distPath = path.resolve('dist');
    const files = await fs.readdir(distPath);

    // Check required files exist
    expect(files).toContain('index.html');
    expect(files.some((f) => f.startsWith('assets'))).toBe(true);

    // Check assets directory
    const assetsPath = path.join(distPath, 'assets');
    const assets = await fs.readdir(assetsPath);

    // Should have CSS and JS files
    expect(assets.some((f) => f.endsWith('.css'))).toBe(true);
    expect(assets.some((f) => f.endsWith('.js'))).toBe(true);
  });

  test('production build serves correct content type', async ({ page }) => {
    const response = await page.goto(BASE_URL);

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('text/html');
  });
});
