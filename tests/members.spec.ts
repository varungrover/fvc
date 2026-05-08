import { test, expect } from '@playwright/test';

test('Customer can add and edit members via API', async ({ page }) => {
  let apiPostHit = false;
  let apiPatchHit = false;

  // Intercept network requests to /api/members
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/members') && request.method() === 'POST') {
      apiPostHit = true;
      console.log('Intercepted POST to /api/members');
    }
    if (url.includes('/api/members') && request.method() === 'PATCH') {
      apiPatchHit = true;
      console.log('Intercepted PATCH to /api/members');
    }
  });

  // 1. Go to login page
  await page.goto('/login');
  
  // 2. Login as a customer (parent)
  await page.fill('input[name="email"]', 'parent@demo.com');
  await page.fill('input[name="password"]', 'password123'); // Adjust if needed
  await page.click('button[type="submit"]');

  // Wait for redirect to customer dashboard
  await page.waitForURL('**/customer/dashboard');

  // 3. Navigate to members page
  await page.click('text="Profile"'); // Or "Members" if it's in the nav
  // Alternatively, just go directly:
  await page.goto('/customer/members');
  await page.waitForLoadState('networkidle');

  // 4. Click Add Member
  await page.click('text="Add Member"');
  
  // 5. Fill out the form
  const uniqueName = `Test Member ${Date.now()}`;
  await page.fill('input[name="fullName"]', uniqueName);
  await page.fill('input[name="dob"]', '2015-05-10'); // YYYY-MM-DD format for date input
  await page.click('button:has-text("Add Member")');

  // Wait for the modal to close and the new member to appear
  await expect(page.locator(`text="${uniqueName}"`)).toBeVisible();
  
  // Verify POST was hit
  expect(apiPostHit).toBe(true);

  // 6. Click Edit on the newly created member
  // Find the card containing the unique name and click the Edit button within it
  const memberCard = page.locator('.card', { hasText: uniqueName }).first();
  // Actually, we can just click "Edit Profile" on the first one or the specific one.
  // The structure is a Card with "Edit Profile" button.
  await page.locator(`text="${uniqueName}"`).locator('xpath=ancestor::div[contains(@class, "card") or contains(@style, "padding: 20")]').locator('text="Edit Profile"').click();

  // 7. Change the name
  const updatedName = `${uniqueName} Updated`;
  await page.fill('input[name="fullName"]', updatedName);
  await page.click('button:has-text("Save Changes")');

  // Wait for update
  await expect(page.locator(`text="${updatedName}"`)).toBeVisible();

  // Verify PATCH was hit
  expect(apiPatchHit).toBe(true);
});
