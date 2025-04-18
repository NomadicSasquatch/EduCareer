require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const enrollmentId = 1; // Replace with a real enrollment ID that has modules
const baseUrl = `http://localhost:${process.env.PORT || 3000}/course-module-detail/${enrollmentId}`;

describe('Course Module Detail Page Tests', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-MODULE-1: Page loads and shows course name and progress', async () => {
    await driver.get(baseUrl);

    const title = await driver.wait(until.elementLocated(By.css('h2')), 10000);
    const progressText = await driver.findElement(By.css('.ant-progress-text'));
    assert.ok(await title.getText(), 'Course title not found');
    assert.ok(await progressText.getText(), 'Progress bar not showing');
  });

  it('REQ-MODULE-2: Clicking a module opens modal with correct content', async () => {
    const card = await driver.wait(until.elementLocated(By.css('.ant-card')), 10000);
    await card.click();
  
    // Wait for modal title and ensure it's not empty
    const modalTitle = await driver.wait(until.elementLocated(By.css('.ant-modal-title')), 5000);
    await driver.wait(async () => {
      const text = await modalTitle.getText();
      return text && text.trim().length > 0;
    }, 5000, 'Modal title did not populate with text');
  
    const titleText = await modalTitle.getText();
    assert.ok(titleText.length > 0, 'Modal title is empty');
  
    const desc = await driver.wait(until.elementLocated(By.css('.ant-modal .ant-typography')), 5000);
    const descText = await desc.getText();
    assert.ok(descText.length > 0, 'Module description is missing');
  
    const statusText = await driver.wait(until.elementLocated(By.css('.ant-modal span.ant-typography')), 5000);
    const status = await statusText.getText();
    assert.ok(status.includes('Status:'), 'Status text missing or incorrect');
  });  

  it('REQ-MODULE-3: Clicking "Mark as Completed" updates progress if not already complete', async () => {
    const button = await driver.findElement(By.xpath("//button[contains(text(), 'Mark as Completed')]")).catch(() => null);
    if (button) {
      await button.click();

      // Wait for success message
      const success = await driver.wait(until.elementLocated(By.css('.ant-message-success')), 5000);
      const text = await success.getText();
      assert.ok(text.toLowerCase().includes('marked'), 'Success message not shown');
    } else {
      console.log('No incomplete module available — skipping this test');
    }
  });
});
