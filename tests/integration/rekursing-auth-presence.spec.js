import { test, expect } from '@playwright/test';

// E2E: Login, presence, and protected API

test.describe.parallel('Rekursing Auth & Presence', () => {
  test('User can login and see chat UI', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.getByText('Sign in to Rekursing')).toBeVisible();
    await page.fill('input[placeholder="Enter username"]', 'Alice');
    await page.click('button:has-text("Sign In")');
    await expect(page.getByText('Chats & Groups')).toBeVisible({ timeout: 10000 });
  });

  test('JWT allows access to /api/me', async ({ page, request }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="Enter username"]', 'Bob');
    await page.click('button:has-text("Sign In")');
    // Get JWT from localStorage
    const jwt = await page.evaluate(() => localStorage.getItem('jwt'));
    const res = await request.get('http://localhost:4000/api/me', {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user.username).toBe('Bob');
  });

  test('Presence: two users see each other online', async ({ browser }) => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    await page1.goto('http://localhost:3000');
    await page2.goto('http://localhost:3000');
    await page1.fill('input[placeholder="Enter username"]', 'Alice');
    await page1.click('button:has-text("Sign In")');
    await page2.fill('input[placeholder="Enter username"]', 'Bob');
    await page2.click('button:has-text("Sign In")');
    // Wait for both to see each other as online
    await expect(page1.locator('li', { hasText: 'Bob' }).locator('span[style*="background: #4caf50"], span[style*="background:#4caf50"], span[style*="background:#4caf50;"]')).toBeVisible({ timeout: 10000 });
    await expect(page2.locator('li', { hasText: 'Alice' }).locator('span[style*="background: #4caf50"], span[style*="background:#4caf50"], span[style*="background:#4caf50;"]')).toBeVisible({ timeout: 10000 });
    await page1.close();
    await page2.close();
  });

  test('Presence updates on logout', async ({ browser }) => {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    await page1.goto('http://localhost:3000');
    await page2.goto('http://localhost:3000');
    await page1.fill('input[placeholder="Enter username"]', 'Alice');
    await page1.click('button:has-text("Sign In")');
    await page2.fill('input[placeholder="Enter username"]', 'Bob');
    await page2.click('button:has-text("Sign In")');
    // Alice logs out (clear localStorage and reload)
    await page1.evaluate(() => { localStorage.clear(); });
    await page1.reload();
    // Bob should see Alice go offline
    await expect(page2.locator('li', { hasText: 'Alice' }).locator('span[style*="background: #888"], span[style*="background:#888"], span[style*="background:#888;"]')).toBeVisible({ timeout: 10000 });
    await page1.close();
    await page2.close();
  });
}); 