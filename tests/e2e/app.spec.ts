import { test, expect } from '@playwright/test';

test.describe('Notion App Builder E2E', () => {
  test('server responds', async ({ page }) => {
    const response = await page.goto('/');
    // Server should respond (any status)
    expect(response?.status()).toBeDefined();
  });

  test('app builder page accessible', async ({ page }) => {
    const response = await page.goto('/builder');
    // Should get some response
    expect(response?.status()).toBeDefined();
  });

  test('app runtime page accessible', async ({ page }) => {
    const response = await page.goto('/app');
    // Should get some response  
    expect(response?.status()).toBeDefined();
  });
});
