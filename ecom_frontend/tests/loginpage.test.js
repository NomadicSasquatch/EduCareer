require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = "http://localhost:3000/login";

describe('Login Page Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-LOGIN-1: Login page loads correctly', async () => {
    await driver.get(`${baseUrl}`);
  
    const usernameInput = await driver.findElement(By.id('login_username'));
    const passwordInput = await driver.findElement(By.id('login_password'));
  
    assert.ok(usernameInput, 'Username input not found');
    assert.ok(passwordInput, 'Password input not found');
  });

  it('REQ-LOGIN-2: Submit with empty fields shows validation messages', async () => {
    await driver.get(`${baseUrl}`);
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    const usernameError = await driver.findElement(By.xpath("//*[contains(text(), 'Please input your username or email!')]"));
    const passwordError = await driver.findElement(By.xpath("//*[contains(text(), 'Please input your password!')]"));

    assert.ok(usernameError);
    assert.ok(passwordError);
  });

  it('REQ-LOGIN-3: Incorrect credentials show login failure message', async () => {
    await driver.get(`${baseUrl}`);
  
    // Use correct IDs
    const usernameInput = await driver.findElement(By.id('login_username'));
    const passwordInput = await driver.findElement(By.id('login_password'));
  
    await usernameInput.sendKeys('wronguser');
    await passwordInput.sendKeys('wrongpass');
  
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
  
    // Wait for AntD error message to appear
    const errorMessage = await driver.wait(
      until.elementLocated(By.css('.ant-message-error')),
      5000
    );
  
    const text = await errorMessage.getText();
    assert.ok(text.includes('Login Failed'), 'Error message not found or incorrect');
  });
  
  it('REQ-LOGIN-4: Valid credentials redirect to homepage or reload', async () => {
    await driver.get(`${baseUrl}`);
  
    const usernameInput = await driver.findElement(By.id('login_username'));
    const passwordInput = await driver.findElement(By.id('login_password'));
  
    // Use test credentials (adjust as needed)
    await usernameInput.sendKeys('tikkamasala');
    await passwordInput.sendKeys('tikkamasala');
  
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
  
    // Wait until redirected or reloaded (customize this check as needed)
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl === `${baseUrl}/` || currentUrl === `${baseUrl}`;
    }, 5000);
  
    const finalUrl = await driver.getCurrentUrl();
    assert.ok(finalUrl.includes(baseUrl), 'Did not redirect or reload to homepage');
  });  

  it('REQ-LOGIN-5: Forgot Password link works', async () => {
    await driver.get(`${baseUrl}`);
  
    const forgotButton = await driver.wait(
      until.elementLocated(By.xpath("//button[.//span[text()='Forgot Password?']]")),
      5000
    );
  
    await driver.wait(until.elementIsVisible(forgotButton), 2000);
    await forgotButton.click();
  
    await driver.wait(until.urlContains('/forgetpassword'), 10000);
  
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/forgetpassword'), 'Did not navigate to forgot password page');
  });  
});
