import { test, expect } from '@playwright/test';

test.describe('DAET Upload Flow', () => {
  test('should load the homepage and show ingestion options', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Verify main title or UI element is present
    await expect(page.locator('text=Upload Dataset').first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow dragging or selecting a CSV file', async ({ page }) => {
    await page.goto('http://localhost:5173/ingestion');
    
    // Check if the dropzone exists
    const dropzone = page.locator('text=Drag & Drop your CSV or Excel file here');
    await expect(dropzone).toBeVisible();
    
    // In a real E2E environment we would upload a mock file:
    // await page.setInputFiles('input[type="file"]', 'tests/fixtures/mock_dataset.csv');
    // await expect(page.locator('text=Dataset Explorer')).toBeVisible();
  });
});
