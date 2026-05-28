import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Weighting spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should calculate survey weights successfully', async ({ page }) => {
    await navigateToTab(page, '/weighting-engine', 'Statistical Estimation');

    // Select target variable
    const targetSelect = page.locator('select').first();
    await targetSelect.selectOption('income');

    // Select weight column
    const weightSelect = page.locator('select').nth(1);
    await weightSelect.selectOption('survey_weight');

    // Click run engine button
    const runBtn = page.getByTestId('weight-run-btn');
    await expect(runBtn).not.toBeDisabled();
    await runBtn.click();

    // Verify statistics results are displayed
    await expect(page.locator('text=Observation Count').first()).toBeVisible({ timeout: 15000 });
    // Use Statistical Confidence (result card only, not in any select option)
    await expect(page.locator('text=Statistical Confidence').first()).toBeVisible();
    await expect(page.locator('text=95% Conf. Interval').first()).toBeVisible();
  });

  test('[API] should reject weighting with non-existent file path', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/statistics/estimate', {
      data: {
        file_path: 'ghost_dataset.csv',
        value_column: 'income',
        weight_column: 'gender',
        analysis_type: 'mean'
      }
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBe("Dataset file not found.");
  });
});

