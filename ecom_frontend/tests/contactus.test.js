require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = "http://localhost:3000/contactus"

describe('Contact Us Page Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-CONTACT-1: Page loads and form fields are visible', async () => {
    await driver.get(`${baseUrl}`);

    const nameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Your name"]')), 10000);
    const emailInput = await driver.findElement(By.css('input[placeholder="Your email"]'));
    const subjectInput = await driver.findElement(By.css('input[placeholder="Subject"]'));

    assert.ok(nameInput);
    assert.ok(emailInput);
    assert.ok(subjectInput);
  });

  it('REQ-CONTACT-2: Submitting empty form triggers validation errors', async () => {
    await driver.get(`${baseUrl}`);

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const nameError = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'enter your name')]")), 5000);
    const emailError = await driver.findElement(By.xpath("//*[contains(text(),'enter your email')]"));

    assert.ok(nameError);
    assert.ok(emailError);
  });

  it('REQ-CONTACT-3: Invalid email format shows validation error', async () => {
    await driver.get(`${baseUrl}`);

    await driver.findElement(By.css('input[placeholder="Your name"]')).sendKeys('Test User');
    await driver.findElement(By.css('input[placeholder="Your email"]')).sendKeys('invalidemail');
    await driver.findElement(By.css('input[placeholder="Subject"]')).sendKeys('Test subject');
    await driver.findElement(By.css('textarea')).sendKeys('This is test feedback.');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const emailError = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'valid email')]")), 5000);
    assert.ok(emailError);
  });

  it('REQ-CONTACT-4: Valid form submission shows success message', async () => {
    await driver.get(`${baseUrl}`);

    await driver.findElement(By.css('input[placeholder="Your name"]')).sendKeys('Test User');
    await driver.findElement(By.css('input[placeholder="Your email"]')).sendKeys('test@example.com');
    await driver.findElement(By.css('.ant-select-selector')).click();
    const bugOption = await driver.findElement(By.xpath("//div[@title='Bug Report']"));
    await bugOption.click();
    await driver.findElement(By.css('input[placeholder="Subject"]')).sendKeys('Form test');
    await driver.findElement(By.css('textarea')).sendKeys('Everything is working!');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const successMsg = await driver.wait(until.elementLocated(By.css('.ant-message-success')), 5000);
    const msgText = await successMsg.getText();
    assert.ok(msgText.toLowerCase().includes('success') || msgText.toLowerCase().includes('thank'));
  });

  it('REQ-CONTACT-BVA-1: Minimal valid input submission displays success message', async () => {
    await driver.get(`${baseUrl}`);
    
    // Minimal valid inputs: using one-character values
    await driver.findElement(By.css('input[placeholder="Your name"]')).sendKeys('A');
    await driver.findElement(By.css('input[placeholder="Your email"]')).sendKeys('a@b.co');
    
    // Select category (assumed to be "Bug Report")
    await driver.findElement(By.css('.ant-select-selector')).click();
    const bugOption = await driver.findElement(By.xpath("//div[@title='Bug Report']"));
    await bugOption.click();
    
    await driver.findElement(By.css('input[placeholder="Subject"]')).sendKeys('A');
    await driver.findElement(By.css('textarea')).sendKeys('A');
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    
    const successMsg = await driver.wait(until.elementLocated(By.css('.ant-message-success')), 5000);
    const msgText = await successMsg.getText();
    assert.ok(msgText.toLowerCase().includes('success') || msgText.toLowerCase().includes('thank'));
  });
  
  it('REQ-CONTACT-BVA-2: Maximum valid input submission displays success message', async () => {
    await driver.get(`${baseUrl}`);
    
    // Maximum valid inputs: assuming maximum lengths for each field
    const maxName = 'A'.repeat(50);  // assuming max length for name is 50 characters
    const maxEmail = 'test' + 'a'.repeat(30) + '@example.com';  // construct a long, valid email
    const maxSubject = 'S'.repeat(100);  // assuming max length for subject is 100 characters
    const maxMessage = 'M'.repeat(500);  // assuming max length for message is 500 characters
    
    await driver.findElement(By.css('input[placeholder="Your name"]')).sendKeys(maxName);
    await driver.findElement(By.css('input[placeholder="Your email"]')).sendKeys(maxEmail);
    
    await driver.findElement(By.css('.ant-select-selector')).click();
    const bugOptionMax = await driver.findElement(By.xpath("//div[@title='Bug Report']"));
    await bugOptionMax.click();
    
    await driver.findElement(By.css('input[placeholder="Subject"]')).sendKeys(maxSubject);
    await driver.findElement(By.css('textarea')).sendKeys(maxMessage);
    
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    
    const successMsg = await driver.wait(until.elementLocated(By.css('.ant-message-success')), 5000);
    const msgText = await successMsg.getText();
    assert.ok(msgText.toLowerCase().includes('success') || msgText.toLowerCase().includes('thank'));
  });
});
