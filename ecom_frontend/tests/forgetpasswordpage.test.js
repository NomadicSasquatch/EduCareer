require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = `http://localhost:${process.env.PORT || 3000}/forgetpassword`;

describe('Forget Password Page Tests', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  async function waitForPage() {
    await driver.get(baseUrl);
    await driver.wait(
      until.elementLocated(By.css('button[type="submit"]')),
      30000
    );
  }

  it('REQ-FORGOT-1: page shows controls', async () => {
    await waitForPage();

    const emailInput  = await driver.findElement(By.css('input[id$="_email"]'));
    const resetBtn    = await driver.findElement(By.css('button[type="submit"]'));
    const backToLogin = await driver.findElement(
      By.xpath("//button//span[text()='Back to Login']")
    );

    assert.ok(await emailInput.isDisplayed());
    assert.ok(await resetBtn.isDisplayed());
    assert.ok(await backToLogin.isDisplayed());
  });

  // it('REQ-FORGOT-2: Submitting an empty form shows validation error for missing email', async () => {
  //   await waitForPage();

  //   const resetBtn = await driver.findElement(By.css('button[type="submit"]'));
  //   await resetBtn.click();

  //   const errorMsg = await driver.wait(
  //     until.elementLocated(
  //       By.xpath("//*[contains(text(),'Please enter your email!')]")
  //     ),
  //     10000
  //   );
  //   assert.ok(
  //     (await errorMsg.getText()).includes('Please enter your email!'),
  //     'Missing email validation error not shown'
  //   );
  // });

  it('REQ-FORGOT-3: Submitting an invalid email shows validation error for email format', async () => {
    await waitForPage();

    const emailInput = await driver.findElement(By.css('input[id$="_email"]'));
    await emailInput.clear();
    await emailInput.sendKeys('invalid-email');

    const resetBtn = await driver.findElement(By.css('button[type="submit"]'));
    await resetBtn.click();

    const errorMsg = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(),'Invalid email format!')]")
      ),
      10000
    );
    assert.ok(
      (await errorMsg.getText()).includes('Invalid email format!'),
      'Invalid email format validation error not shown'
    );
  });

  // it('REQ-FORGOT-4: Submitting a valid email displays a success message', async () => {
  //   await waitForPage();

  //   const emailInput = await driver.findElement(By.css('input[id$="_email"]'));
  //   await emailInput.clear();
  //   await emailInput.sendKeys('user@example.com');

  //   const resetBtn = await driver.findElement(By.css('button[type="submit"]'));
  //   await resetBtn.click();

  //   const successMsg = await driver.wait(
  //     until.elementLocated(
  //       By.xpath("//*[contains(text(),'Password reset link sent! Check your email.')]")
  //     ),
  //     10000
  //   );
  //   assert.ok(
  //     (await successMsg.getText()).includes('Password reset link sent! Check your email.'),
  //     'Success message not shown on valid submission'
  //   );
  // });

  it('REQ-FORGOT-5: Clicking "Back to Login" navigates to the login page', async () => {
    await waitForPage();

    const backToLogin = await driver.findElement(
      By.xpath("//button//span[text()='Back to Login']")
    );
    await backToLogin.click();

    await driver.wait(until.urlContains('/login'), 10000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(
      currentUrl.includes('/login'),
      'Did not navigate to the login page after clicking Back to Login'
    );
  });
});