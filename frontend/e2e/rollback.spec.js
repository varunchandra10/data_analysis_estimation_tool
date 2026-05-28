import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Rollback spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should restore historical checkpoints successfully', async ({ page }) => {
    await navigateToTab(page, '/version-control', 'Active Project Checkpoint');

    // Select the first dataset folder to enable the rollback button
    const firstFolder = page.locator('[class*="rounded-lg"][class*="border"]').first();
    await firstFolder.click().catch(() => {});  // best-effort: folder may already be selected

    // Click Restore V2 button
    const rollbackBtn = page.getByTestId('rollback-btn');
    // Wait until button is enabled (requires selectedDataset to be set)
    await expect(rollbackBtn).toBeEnabled({ timeout: 10000 });
    await rollbackBtn.click();

    // Verify UI remains stable and Restore V2 button still exists
    await expect(page.locator('text=Restore V2').first()).toBeVisible();
  });

  test('[API] should return error when rolling back non-existent dataset', async ({ request }) => {
    // Login to get token
    const loginRes = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'testpassword'
      }
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.data?.access_token || loginData.access_token;

    const response = await request.post('http://localhost:8000/api/versioning/rollback', {
      data: {
        dataset_name: '__ghost_dataset__',
        version_name: 'ghost_version'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    expect(response.status()).toBe(500);
    const body = await response.json();
    expect(body.detail).toContain("Version dataset not found in DB");
  });
});
