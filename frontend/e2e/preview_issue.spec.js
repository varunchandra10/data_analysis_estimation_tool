import { test, expect } from '@playwright/test';
import { uploadTestDataset, navigateToTab } from './utils/helpers.js';

test.describe('DAET Preview Issue Reproducer - Fixed Preview Button', () => {
  test.beforeEach(async ({ page }) => {
    // Capture page console logs
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', exception => {
      console.log(`[BROWSER UNCAUGHT EXCEPTION] ${exception.message}`);
    });

    await uploadTestDataset(page);
  });

  test('click preview button and verify navigation + rendering on both pages', async ({ page }) => {
    // 1. Go to Version Control page
    await navigateToTab(page, '/version-control', 'Active Project Checkpoint');

    // 2. Select the repository / dataset folder (first one in list)
    const firstFolder = page.locator('button:has-text("test_data")').first();
    await expect(firstFolder).toBeVisible({ timeout: 10000 });
    await firstFolder.click();

    // 3. Select the file/checkpoint (e.g. raw_test_data.csv)
    const firstFile = page.locator('div:has-text("raw_test_data.csv")').first();
    await expect(firstFile).toBeVisible({ timeout: 10000 });
    await firstFile.click();

    // 4. Click the Preview button (which should now update context and go to /dataset-explorer)
    const previewBtn = page.getByRole('button', { name: 'Preview', exact: true });
    await expect(previewBtn).toBeEnabled({ timeout: 10000 });
    console.log('Clicking the Preview button...');
    await previewBtn.click();

    // The app should automatically navigate to /dataset-explorer
    await page.waitForTimeout(3000);

    // Verify if we are on dataset explorer and see Integrity Index
    const integrityHeader = page.locator('text=Integrity Index');
    const isIntegrityVisible = await integrityHeader.isVisible().catch(() => false);
    console.log(`Dataset Explorer Integrity Index visible: ${isIntegrityVisible}`);

    // Take screenshot of Dataset Explorer
    await page.screenshot({ path: 'dataset_explorer_after_fix.png' });

    // 5. Navigate to Whole Dataset page
    console.log('Navigating to Whole Dataset...');
    await navigateToTab(page, '/whole-dataset');
    await page.waitForTimeout(2000);

    // Verify if Whole Dataset page is displaying content
    const liveStreamText = page.locator('text=Live Stream Channel Active');
    const isLiveStreamVisible = await liveStreamText.isVisible().catch(() => false);
    console.log(`Whole Dataset Live Stream visible: ${isLiveStreamVisible}`);

    // Take screenshot of Whole Dataset page
    await page.screenshot({ path: 'whole_dataset_after_fix.png' });

    // Expecting pages to work properly
    expect(isIntegrityVisible).toBe(true);
    expect(isLiveStreamVisible).toBe(true);
  });
});
