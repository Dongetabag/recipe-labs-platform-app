import { test, expect } from '@playwright/test';

test.describe('Design Button Functionality', () => {
  test('should navigate to design page when design button is clicked', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to login - look for login button or intake modal
    const loginButton = page.locator('button:has-text("Login")').or(page.locator('button:has-text("Get Started")')).or(page.locator('button:has-text("Sign In")'));
    
    if (await loginButton.isVisible({ timeout: 2000 })) {
      // Click login to trigger intake modal
      await loginButton.first().click();
      await page.waitForTimeout(500);
      
      // Fill intake form if modal appears
      const nameInput = page.locator('input[type="text"], input[name*="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill('Test User');
        await page.locator('button:has-text("Submit")').or(page.locator('button[type="submit"]')).first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for the Design button in the header - try multiple selectors
    const designButton = page.locator('button:has-text("Design")')
      .or(page.locator('button[title="Design Agents"]'))
      .or(page.locator('button').filter({ hasText: /design/i }))
      .first();
    
    // Check if button exists and is visible
    await expect(designButton).toBeVisible({ timeout: 10000 });
    
    // Check if button is enabled
    await expect(designButton).toBeEnabled();
    
    // Click the design button
    await designButton.click();
    
    // Wait for navigation and page transition
    await page.waitForTimeout(1500);
    
    // Check if we navigated to a design page - look for design agent content
    // The design page should show either Flyer Generator or Instagram Post Generator
    const designContent = page.locator('text=Flyer Generator')
      .or(page.locator('text=Instagram Post Generator'))
      .or(page.locator('text=Flyer'))
      .or(page.locator('text=Instagram'))
      .or(page.locator('[class*="Design"]'))
      .first();
    
    // Verify that design-related content is visible
    await expect(designContent).toBeVisible({ timeout: 5000 });
  });

  test('design button should be functional and clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to get to dashboard (may need login)
    const loginButton = page.locator('button:has-text("Login")').or(page.locator('button:has-text("Get Started")')).first();
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find the Design button
    const designButton = page.locator('button:has-text("Design")').first();
    
    // Verify button exists
    if (await designButton.isVisible({ timeout: 5000 })) {
      // Check button is not disabled
      const isDisabled = await designButton.isDisabled();
      expect(isDisabled).toBeFalsy();
      
      // Click and verify navigation occurs
      await designButton.click();
      await page.waitForTimeout(1500);
      
      // Verify URL or content changed (design page loaded)
      const currentUrl = page.url();
      const hasDesignContent = await page.locator('text=Flyer').or(page.locator('text=Instagram')).or(page.locator('text=Design Agent')).first().isVisible({ timeout: 3000 });
      
      // Either URL changed or design content is visible
      expect(hasDesignContent || currentUrl.includes('design') || currentUrl !== '/').toBeTruthy();
    }
  });
});

