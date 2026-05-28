import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Pipeline spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should execute full pipeline successfully', async ({ page }) => {
    await navigateToTab(page, '/statistical-engine', 'Analytical Intelligence Terminal');

    // Click Run Full Pipeline
    const pipeBtn = page.getByTestId('pipeline-run-btn');
    await expect(pipeBtn).not.toBeDisabled();
    await pipeBtn.click();

    // Verify it runs and updates the status
    await expect(page.locator('text=Pipeline Run').first()).toBeVisible({ timeout: 25000 });
  });

  test('[API] should return error for pipeline execution on non-existent file', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/pipeline/run', {
      data: {
        file_path: 'ghost_dataset.csv'
      }
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBe("Dataset file not found.");
  });
});

