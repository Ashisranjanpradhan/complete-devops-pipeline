import { test, expect } from '@playwright/test';

/**
 * OpsMind AI - Flagship E2E Incident & Rollback Journey Test
 * Validates the full operator lifecycle:
 * Login -> Dashboard Telemetry -> Open Service -> Create/View Incident ->
 * Autonomous AI Investigation -> Correlate Evidence -> Controlled Rollback -> Mitigation Verification
 */

test.describe('OpsMind AI Flagship Incident Management Lifecycle', () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:80';

  test('Complete incident correlation and controlled rollback workflow', async ({ page }) => {
    // 1. Authenticate with RBAC credentials
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Validate Operations Dashboard rendering
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Operations Dashboard');
    await expect(page.locator('text=Platform Status: Operational')).toBeVisible();

    // 3. Inspect Service Catalog
    await page.click('a:has-text("Services")');
    await expect(page.locator('h1')).toContainText('Service Catalog');
    await expect(page.locator('text=payment-service')).toBeVisible();

    // 4. Navigate to Incidents console
    await page.click('a:has-text("Incidents")');
    await expect(page.locator('h1')).toContainText('Incident Management');

    // 5. Open Flagship Incident Details
    const flagshipIncident = page.locator('text=Payment API 5xx errors spiked').first();
    await flagshipIncident.click();

    // 6. Verify Incident Details & Autonomous AI Analysis
    await expect(page.locator('text=AI Incident Assistant')).toBeVisible();
    await expect(page.locator('text=AI Safety Notice')).toBeVisible();

    // Trigger AI correlation if not already present
    const aiAnalyzeButton = page.locator('button:has-text("Analyze Incident with AI"), button:has-text("Re-Analyze Incident")');
    await expect(aiAnalyzeButton).toBeVisible();
    await aiAnalyzeButton.click();

    // 7. Verify Correlated Evidence and Confidence
    await expect(page.locator('text=Probable Root Cause')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Supporting Evidence Correlated')).toBeVisible();

    // 8. Execute Operator Rollback
    const rollbackButton = page.locator('button:has-text("Execute Rollback")');
    await rollbackButton.click();

    // Fill Rollback Reason & Submit
    await page.fill('textarea', 'E2E Automated test: Verified AI root-cause correlation; rolling back to v2.8.0');
    await page.click('button:has-text("Authorize Rollback")');

    // 9. Verify Incident Status moves to RESOLVED
    await expect(page.locator('text=RESOLVED').first()).toBeVisible({ timeout: 10000 });
  });
});
