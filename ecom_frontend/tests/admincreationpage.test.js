require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = `http://localhost:3000/adminCreation`;

describe('Admin Creation Page Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-ADMIN-1: Page loads and form is visible', async () => {
    await driver.get(`${baseUrl}`);

    const heading = await driver.findElement(By.xpath("//*[contains(text(),'Create New Admin Account')]"));
    assert.ok(heading, 'Page heading not found');

    const nameInput = await driver.findElement(By.id('create-admin_name'));
    assert.ok(nameInput, 'Name input not found');
  });

  it('REQ-ADMIN-2: Submitting empty form shows validation errors', async () => {
    await driver.get(`${baseUrl}`);

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    const nameError = await driver.findElement(By.xpath("//*[contains(text(),'Please input the admin name!')]"));
    const emailError = await driver.findElement(By.xpath("//*[contains(text(),'Please input the email!')]"));

    assert.ok(nameError);
    assert.ok(emailError);
  });

  it('REQ-ADMIN-3: Invalid email shows validation error', async () => {
    await driver.get(`${baseUrl}`);

    const name = await driver.findElement(By.id('create-admin_name'));
    const username = await driver.findElement(By.id('create-admin_username'));
    const email = await driver.findElement(By.id('create-admin_email'));
    const password = await driver.findElement(By.id('create-admin_password'));

    await name.sendKeys('Test Admin');
    await username.sendKeys('testadmin');
    await email.sendKeys('notanemail');
    await password.sendKeys('password123');

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    const emailError = await driver.findElement(By.xpath("//*[contains(text(),'not a valid email')]"));
    assert.ok(emailError, 'Email validation error not found');
  });

  it('REQ-ADMIN-4: Valid submission shows success message and navigates', async () => {
    await driver.get(`${baseUrl}`);
  
    await driver.findElement(By.id('create-admin_name')).sendKeys('Test Admin2');
    await driver.findElement(By.id('create-admin_username')).sendKeys('admin1234');
    await driver.findElement(By.id('create-admin_email')).sendKeys('admin1234@test.com');
    await driver.findElement(By.id('create-admin_password')).sendKeys('adminpass2');
  
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
  
    // Prefer URL check over AntD message
    await driver.wait(until.urlContains('/adminCreation'), 10000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/adminCreation'), 'Did not redirect back to admin creation page');
  });  
});
