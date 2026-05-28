import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Cleaning spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should impute missing values successfully', async ({ page }) => {
    await navigateToTab(page, '/null-analysis', 'Null Observation Audit');

    // Verify age is in null observations list
    await expect(page.locator('text=age').first()).toBeVisible();

    // Select Mean strategy for age
    const select = page.locator('select').first();
    await select.selectOption('mean');

    // Click commit button - disabled until at least one strategy is chosen, wait for React state update
    const cleanBtn = page.getByTestId('clean-btn');
    await expect(cleanBtn).toBeEnabled({ timeout: 10000 });
    await cleanBtn.click();

    // Verify complete message and completeness score becomes 100%
    await expect(page.locator('text=Completeness Score').first()).toBeVisible();
    await expect(page.locator('text=100%').first()).toBeVisible();
  });

  test('[API] should return error for cleaning request with non-existent file path', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/clean/missing-values', {
      data: {
        file_path: 'ghost_dataset.csv',
        strategies: { age: 'mean' }
      }
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBe("Dataset file not found.");
  });
});

