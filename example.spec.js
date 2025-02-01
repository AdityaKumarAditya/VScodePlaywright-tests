const { test, expect, chromium } = require('@playwright/test');

test('User is able to signup', async () => {
  // Launch the page
  const chrome = await chromium.launch({ headless: false });
  const page = await chrome.newPage();

  /************************ Step 1: Email and password screen ************************/
  await page.goto('https://app.circula.com/users/sign_up');

  // Accept cookies
  const cookieAcceptButton = page.locator('button:has-text("Accept")');
  await cookieAcceptButton.waitFor({ state: 'visible', timeout: 3000 });
  await cookieAcceptButton.click();
  await expect(page).toHaveTitle(/Signup - Circula/);
  const trialTextLocator = page.locator('text=Start your 14-day free trial');
  expect(trialTextLocator).toBeVisible();
  const workEmailField = page.locator('input[name="email"]');
  const isEditable = await workEmailField.isEditable();
  expect(isEditable).toBe(true);

  // Validate invalid input scenario
  await workEmailField.fill('aditya.kumar@gmail.com');
  const passwordField = page.locator('input[name="password"]');
  await passwordField.fill('Circula');
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[name="acceptTos"]');
    if (!checkbox.checked) {
      checkbox.click();
    }
  });
  const tryForFreeButton = page.locator('//button[contains(text(), "Try for free")]');
  await tryForFreeButton.click();
  let isButtonDisabled = await tryForFreeButton.isDisabled();
  expect(isButtonDisabled).toBe(true);

  // Enter Valid Input and proceed 
  await workEmailField.fill('aditya.kumar@genisys-group.com');
  await passwordField.fill('Circula123');
  await tryForFreeButton.click();


  /************************ Step 2: Contact details screen ************************/
  const step2TextLocator = page.locator('text=Your contact details');
  await expect(step2TextLocator).toBeVisible();

  // Empty field scenario
  const nextStepButton = page.locator('button[type="submit"]');
  await nextStepButton.click();
  const errorMessage = page.locator('text=First name is required.');
  await expect(errorMessage).toBeVisible();

  // Positive flow
  const firstNameField = page.locator('input[name="firstname"]');
  const lastNameField = page.locator('input[name="lastname"]');
  const phoneNumberField = page.locator('input[name="phoneNumber"]');
  await firstNameField.fill('Aaaaaaaaditya');
  await lastNameField.fill('Kumar');
  await phoneNumberField.fill('122322323432434567890');
  const isNextStepButtonEnabled = await nextStepButton.isEnabled();
  expect(isNextStepButtonEnabled).toBeTruthy();
  await nextStepButton.click();


  /************************ Step 3: Additional details screen ************************/
  const step3TextLocator = page.locator('text=Company information');
  await step3TextLocator.waitFor({ state: 'visible', timeout: 5000 });
  const companyNameField = page.locator('input[name="organizationName"]');
  await companyNameField.fill('Genisys');
  
  // Select values from a dynamic dropdown
  const countryInput = page.locator('input[name="country"]');
  await countryInput.click();
  await countryInput.fill('Sweden');
  await countryInput.press('ArrowDown');
  await countryInput.press('Enter');
  const inputValue = await countryInput.inputValue();
  expect(inputValue).toBe('Sweden');
  await chrome.close();
});