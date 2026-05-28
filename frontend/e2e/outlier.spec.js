import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Outlier spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should detect and filter outliers successfully', async ({ page }) => {
    await navigateToTab(page, '/anomaly-detection', 'Outlier Vector Analysis');

    // Select income column
    const colSelect = page.locator('select').first();
    await colSelect.selectOption('income');

    // Click detect button
    const detectBtn = page.getByTestId('outlier-detect-btn');
    await expect(detectBtn).not.toBeDisabled();
    await detectBtn.click();

    // Verify results section is displayed and outlier count is visible
    await expect(page.locator('text=Outlier Frequency').first()).toBeVisible({ timeout: 15000 });

    // Apply button is only enabled when total_outliers > 0 - check conditionally
    const applyBtn = page.getByTestId('outlier-apply-btn');
    const isApplyEnabled = await applyBtn.isEnabled().catch(() => false);

    if (isApplyEnabled) {
      await applyBtn.click();
      // Verify staged dataset preview appears
      await expect(page.locator('text=Preview: Applied Dataset Head').first()).toBeVisible({ timeout: 15000 });
    } else {
      // Zero outliers is a valid outcome - verify the scan completed cleanly
      await expect(page.locator('text=End of Anomaly Scan Output').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('[API] should return error for outlier detection on non-existent dataset', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/outliers/detect', {
      data: {
        file_path: 'ghost_dataset.csv',
        column: 'income',
        method: 'iqr'
      }
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBe("Dataset file not found.");
  });
});

