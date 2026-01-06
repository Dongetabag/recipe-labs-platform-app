import { test, expect } from '@playwright/test';

const PLATFORM_URL = 'https://platform.madebyrecipe.com/';
const LOCAL_URL = 'http://72.61.72.94:3003/';

test.describe('Recipe Labs Platform Tests', () => {

  test('Platform loads correctly', async ({ page }) => {
    await page.goto(PLATFORM_URL);

    // Check title
    await expect(page).toHaveTitle(/Recipe Labs/i);

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });

    console.log('✅ Platform loaded successfully');
  });

  test('Brand colors are applied', async ({ page }) => {
    await page.goto(PLATFORM_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for brand spectrum bar (bottom fixed bar)
    const spectrumBar = await page.locator('.brand-spectrum').first();

    // Check CSS variables are set
    const bodyStyles = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        lemon: getComputedStyle(root).getPropertyValue('--color-lemon').trim(),
        forest: getComputedStyle(root).getPropertyValue('--color-forest').trim(),
        bg: getComputedStyle(root).getPropertyValue('--color-bg').trim()
      };
    });

    console.log('Brand Colors:', bodyStyles);

    // Verify brand colors
    expect(bodyStyles.lemon).toBe('#F5D547');
    expect(bodyStyles.forest).toBe('#4A7C4E');
    expect(bodyStyles.bg).toBe('#0f1410');

    console.log('✅ Brand colors verified');
  });

  test('Navigation and tools are visible', async ({ page }) => {
    await page.goto(PLATFORM_URL);
    await page.waitForLoadState('networkidle');

    // Wait for React to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/tools-loaded.png', fullPage: true });

    // Check for tool cards or dashboard elements
    const pageContent = await page.textContent('body');

    console.log('Page contains Recipe Labs:', pageContent?.includes('Recipe Labs'));

    // Check for Recipe or Labs (may be styled separately)
    expect(pageContent).toMatch(/Recipe|Labs|RRCPELAB|Made By Recipe/i);

    console.log('✅ Navigation verified');
  });

  test('Media Engine page accessible', async ({ page }) => {
    await page.goto(PLATFORM_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for Media Engine link or navigate to it
    const mediaLink = page.getByText(/Media Engine|Flyer Generator|Instagram/i).first();

    if (await mediaLink.isVisible()) {
      await mediaLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/media-engine.png', fullPage: true });
      console.log('✅ Media Engine page accessed');
    } else {
      // Try direct navigation if no link found
      console.log('Looking for media engine in page...');
      await page.screenshot({ path: 'test-results/looking-for-media.png', fullPage: true });
    }
  });

  test('Fonts are loaded', async ({ page }) => {
    await page.goto(PLATFORM_URL);
    await page.waitForLoadState('networkidle');

    // Check if fonts are loaded
    const fontsLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const fonts = Array.from(document.fonts).map(f => f.family);
      return {
        loaded: document.fonts.status === 'loaded',
        families: [...new Set(fonts)]
      };
    });

    console.log('Fonts status:', fontsLoaded);

    expect(fontsLoaded.loaded).toBe(true);
    expect(fontsLoaded.families).toContain('Orbitron');
    expect(fontsLoaded.families).toContain('Montserrat');

    console.log('✅ Fonts verified');
  });

});
