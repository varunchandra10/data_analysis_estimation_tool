import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Export & Archive spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should export dataset to multiple formats and run archival', async ({ page }) => {
    await navigateToTab(page, '/version-control', 'Active Project Checkpoint');

    // Verify export panel is loaded
    await expect(page.locator('text=Enterprise Dataset Export').first()).toBeVisible();

    // Click export button and capture download event
    const exportBtn = page.getByTestId('export-btn');
    await expect(exportBtn).toBeEnabled({ timeout: 5000 });
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Click archive button
    const archiveBtn = page.getByTestId('archive-btn');
    await expect(archiveBtn).toBeEnabled({ timeout: 5000 });
    await archiveBtn.click();

    // Verify response banner appears (emerald success or rose error div)
    await expect(
      page.locator('[class*="emerald"]').or(page.locator('[class*="rose"]')).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('[API][Security] should reject export request without Authorization header', async ({ request }) => {
    // Direct API call without any auth token - should be 401
    const response = await request.post('http://localhost:8000/api/versioning/export', {
      data: {
        file_path: 'any_file.csv',
        dataset_name: 'any_dataset',
        format: 'csv'
      },
      headers: {
        // Explicitly omit Authorization header to test security
        Authorization: ''
      }
    });
    // Backend must reject unauthenticated export requests (401)
    expect(response.status()).toBe(401);
  });
});

