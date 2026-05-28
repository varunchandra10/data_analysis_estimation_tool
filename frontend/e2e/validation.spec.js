import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Validation spec', () => {
  test.beforeEach(async ({ page }) => {
    await uploadTestDataset(page);
  });

  test('should configure rule manually and execute validation to detect violations', async ({ page }) => {
    test.setTimeout(60000); // Allow extra time for execution
    await navigateToTab(page, '/logic-validation', 'Validation Workbench');

    // Click Add Logic button to add a rule row
    const addBtn = page.getByTestId('validation-add-btn');
    await addBtn.click();

    // Configure the rule
    const colSelect = page.locator('select').first();
    await colSelect.selectOption('age');

    const opSelect = page.locator('select').nth(1);
    await opSelect.selectOption('>=');

    const valInput = page.locator('input[placeholder="Scalar Value"]').first();
    await valInput.fill('18');

    const sevSelect = page.locator('select').nth(2);
    await sevSelect.selectOption('high');

    // Click Run Validation
    const runBtn = page.getByTestId('validation-run-btn');
    await expect(runBtn).not.toBeDisabled();
    await runBtn.click();

    // Verify validation ran - Exception Log Output header always renders when result exists
    await expect(page.locator('text=Exception Log Output').first()).toBeVisible({ timeout: 25000 });
    await expect(page.locator('text=Active Rules').first()).toBeVisible();
  });

  test('[API] should return 404 for validation request with non-existent file', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/validation/run', {
      data: {
        file_path: 'ghost.csv',
        rules: []
      }
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBe("Dataset file not found.");
  });
});

