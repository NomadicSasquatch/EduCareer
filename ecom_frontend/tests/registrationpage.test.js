require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = "http://localhost:3000/register";

describe('Registration Page Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-REG-1: Registration page loads with Learner tab active', async () => {
    await driver.get(`${baseUrl}`);

    const learnerTab = await driver.findElement(By.xpath("//div[contains(@class,'ant-tabs-tab-active')]//div[text()='Learner']"));
    assert.ok(learnerTab, 'Learner tab is not active by default');
  });

  it('REQ-REG-2: Submit empty learner form triggers validation errors', async () => {
    await driver.get(`${baseUrl}`);

    const submitButton = await driver.findElement(By.xpath("//button[.//span[text()='Register as Learner']]"));
    await submitButton.click();

    const usernameError = await driver.findElement(By.xpath("//*[contains(text(),'Username is required!')]"));
    const passwordError = await driver.findElement(By.xpath("//*[contains(text(),'Password is required!')]"));

    assert.ok(usernameError);
    assert.ok(passwordError);
  });

  it('REQ-REG-3: Switch to Provider tab and check form visibility', async () => {
    await driver.get(`${baseUrl}`);

    const providerTab = await driver.findElement(By.xpath("//div[text()='Provider']"));
    await providerTab.click();

    const submitButton = await driver.wait(
      until.elementLocated(By.xpath("//button[.//span[text()='Register as Provider']]")),
      5000
    );

    assert.ok(submitButton, 'Provider form not visible');
  });

  it('REQ-REG-4: Submit empty provider form triggers validation errors', async () => {
    await driver.get(`${baseUrl}`);

    const providerTab = await driver.findElement(By.xpath("//div[text()='Provider']"));
    await providerTab.click();

    const submitButton = await driver.wait(
      until.elementLocated(By.xpath("//button[.//span[text()='Register as Provider']]")),
      5000
    );

    await submitButton.click();

    const usernameError = await driver.findElement(By.xpath("//*[contains(text(),'Username is required!')]"));
    const passwordError = await driver.findElement(By.xpath("//*[contains(text(),'Password is required!')]"));

    assert.ok(usernameError);
    assert.ok(passwordError);
  });
});
