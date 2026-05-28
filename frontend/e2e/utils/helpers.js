import { expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadTestDataset(page) {
  // Navigate to ingestion page
  await page.goto('http://localhost:5173/ingestion');

  // If we are already redirected or see the explorer, skip upload
  if (page.url().includes('dataset-explorer')) {
    await expect(page.locator('text=Integrity Index')).toBeVisible({ timeout: 20000 });
    return;
  }

  // Check if dropzone is visible
  try {
    await expect(page.getByTestId('upload-dropzone')).toBeVisible({ timeout: 4000 });
  } catch (err) {
    // If dropzone is not visible, check if we got redirected in the meantime
    if (page.url().includes('dataset-explorer')) {
      await expect(page.locator('text=Integrity Index')).toBeVisible({ timeout: 20000 });
      return;
    }
    throw err;
  }

  // Locate the input element inside dropzone
  const fileInput = page.locator('input[data-testid="upload-input"]');
  const testDataPath = path.resolve(__dirname, '../data/test_data.csv');
  
  await fileInput.setInputFiles(testDataPath);

  // Wait until completed message or redirect to explorer
  await expect(page).toHaveURL(/.*(dataset-explorer|\/?)$/, { timeout: 20000 });
  await expect(page.locator('text=Integrity Index')).toBeVisible({ timeout: 20000 });
}

/**
 * SPA-safe navigation: clicks the sidebar anchor by href to preserve React context
 * (in-memory datasetData). Using page.goto() on a React SPA destroys context state.
 */
export async function navigateToTab(page, tabPath, textTrigger) {
  // Click the sidebar link that matches this path to stay within the SPA
  const sidebarLink = page.locator(`a[href="${tabPath}"]`).first();
  
  if (await sidebarLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sidebarLink.click();
  } else {
    // Fallback: use page.goto() if we're outside the authenticated layout (e.g., no dataset loaded)
    await page.goto(`http://localhost:5173${tabPath}`);
  }

  if (textTrigger) {
    await expect(page.locator(`text=${textTrigger}`).first()).toBeVisible({ timeout: 15000 });
  }
}

