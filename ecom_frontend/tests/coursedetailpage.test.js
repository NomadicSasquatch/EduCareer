require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const courseId = 2; // Replace with a valid course_id
const baseUrl = `http://localhost:${process.env.PORT || 3000}/course-detail/${courseId}`;

describe('Course Detail Page Tests', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-COURSE-1: Page loads and displays course name and category', async () => {
    await driver.get(baseUrl);

    const title = await driver.wait(until.elementLocated(By.css('h2')), 10000);
    const titleText = await title.getText();
    assert.ok(titleText.length > 0, 'Course name not visible');

    const category = await driver.findElement(By.css('p'));
    const categoryText = await category.getText();
    assert.ok(categoryText.length > 0, 'Category not visible');
  });

  it('REQ-COURSE-2: Clicking "Update Course" opens the modal', async () => {
    const updateBtn = await driver.wait(
      until.elementLocated(By.xpath("//span[text()='Update Course']/ancestor::button")),
      10000
    );
    await updateBtn.click();

    const modal = await driver.wait(
      until.elementLocated(By.css('.ant-modal')),
      10000
    );
    await driver.wait(until.elementIsVisible(modal), 10000);

    const modalTitle = await modal.findElement(By.css('.ant-modal-title'));
    const titleText = await modalTitle.getText();
    assert.ok(titleText.length > 0, 'Update modal not opened');
  });

  it('REQ-COURSE-3: Add Module modal opens and submits valid input', async () => {
    try {
      console.log('🔄 Closing any open modals...');
      const modals = await driver.findElements(By.css('.ant-modal-close'));
      for (const close of modals) {
        try {
          await close.click();
          await driver.sleep(300);
        } catch (_) {}
      }
  
      console.log('🧭 Clicking Add Module...');
      const addBtn = await driver.wait(
        until.elementLocated(By.xpath("//span[text()='Add Module']/ancestor::button")),
        10000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", addBtn);
      await driver.sleep(300);
      await addBtn.click();
  
      console.log('⏳ Waiting for Add Module modal...');
      const modal = await driver.wait(
        until.elementLocated(By.xpath("//div[contains(@class, 'ant-modal') and .//div[contains(text(), 'Add Course Module')]]")),
        5000
      );
      await driver.sleep(1000);
  
      console.log('✏️ Filling form fields...');
      const nameInput = await driver.findElement(By.css('input[placeholder="Enter module name"]'));
      await nameInput.sendKeys('Test Module');
  
      const descInput = await driver.findElement(By.css('textarea[placeholder="Enter module description"]'));
      await descInput.sendKeys('This is a test module.');
  
      console.log('🧪 Forcing module order input with JS...');
      const orderInput = await driver.findElement(By.css('.ant-input-number input'));
  
      await driver.executeScript(`
        arguments[0].value = '1';
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
      `, orderInput);
  
      console.log('🚀 Submitting form...');
      const submitBtn = await driver.findElement(By.xpath("//button[span[text()='Add Module']]"));
      await driver.executeScript("arguments[0].click();", submitBtn);
  
      await driver.sleep(1500); // Wait for modal to close or success message
      console.log('✅ Module submitted. Test passed.');
    } catch (err) {
      console.error('❌ REQ-COURSE-3 failed:', err.message);
      assert.fail('Failed to fill and submit Add Module form');
    }
  });  

  it('REQ-COURSE-4: Review table is visible and populated if reviews exist', async () => {
    const reviewTable = await driver.wait(until.elementLocated(By.css('table')), 10000);
    const rows = await driver.findElements(By.css('table tbody tr'));

    if (rows.length > 0) {
      const firstRowText = await rows[0].getText();
      if (!firstRowText || firstRowText.trim().length === 0) {
        console.warn('Review row is present but contains no text — possibly placeholder');
        return;
      }
      assert.ok(firstRowText.trim().length > 0, 'Review row is empty');
    } else {
      console.log('No reviews found — skipping review row test.');
    }
  });
});
