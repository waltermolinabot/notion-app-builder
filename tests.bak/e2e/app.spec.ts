import { test, expect } from '@playwright/test';

test.describe('Notion App Builder E2E', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Notion App Builder/);
    await expect(page.getByRole('heading', { name: /Conecta tu Notion/i })).toBeVisible();
  });

  test('can navigate to sign in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Iniciar sesión/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });

  test('app builder shows blocks', async ({ page }) => {
    // This would require auth - testing the component structure
    await page.goto('/builder/demo');
    await expect(page.getByText('Arrastra bloques aquí')).toBeVisible();
  });

  test('portal runtime renders', async ({ page }) => {
    await page.goto('/app/demo');
    // Demo data should render
    await expect(page.getByText('Clientes')).toBeVisible();
  });
});
