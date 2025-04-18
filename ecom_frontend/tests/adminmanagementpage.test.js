require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = `http://localhost:3000/adminmanagementpage`;

describe('Admin Management Page Tests', function () {
    this.timeout(40000); // extra buffer for slower grid rendering
    let driver;
  
    before(async () => {
      driver = await new Builder().forBrowser('chrome').build();
    });
  
    after(async () => {
      await driver.quit();
    });
  
    it('REQ-MGMT-1: Page loads and ag-Grid appears', async () => {
      await driver.get(baseUrl);
      const grid = await driver.wait(until.elementLocated(By.css('.ag-root-wrapper')), 10000);
      assert.ok(grid, 'ag-Grid not found');
    });
  
    it('REQ-MGMT-2: Switching to Admin table shows Create/Delete buttons', async () => {
      await driver.get(baseUrl);
  
      const adminTab = await driver.findElement(By.xpath("//a[text()='Admin']"));
      await adminTab.click();
  
      await driver.wait(until.elementLocated(By.css('.ag-row')), 10000);
  
      const createBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[.//span[text()='Create New Admin Account']]")),
        10000
      );
      const deleteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[.//span[contains(text(),'Delete Selected Admin')]]")),
        10000
      );
  
      assert.ok(createBtn);
      assert.ok(deleteBtn);
    });
  
    it('REQ-MGMT-3: Clicking Edit in Courses without selection shows error or is skipped on empty grid', async () => {
        await driver.get(baseUrl);
    
        const coursesTab = await driver.findElement(By.xpath("//a[text()='Courses']"));
        await coursesTab.click();
    
        await driver.wait(until.elementLocated(By.css('.ag-root-wrapper')), 10000);
    
        // Try to find at least one row
        const rows = await driver.findElements(By.css('.ag-row'));
    
        if (rows.length === 0) {
          console.log('No rows in Courses table — skipping edit test');
          return;
        }
    
        const editBtn = await driver.findElement(
          By.xpath("//button[.//span[text()='Edit Selected Row']]")
        );
        await editBtn.click();
    
        const errorMsg = await driver.wait(
          until.elementLocated(By.css('.ant-message-error')),
          5000
        );
        const errorText = await errorMsg.getText();
        assert.ok(errorText.includes('select exactly one row'), 'Expected error message not shown');
      });
    
      it('REQ-MGMT-4: Raw data debug panel appears even if empty', async () => {
        await driver.get(baseUrl);
    
        await driver.wait(until.elementLocated(By.css('.ag-root-wrapper')), 10000);
        const pre = await driver.findElement(By.css('pre'));
        const rawData = await pre.getText();
    
        // Accept either data or empty array
        const isValidJSON = rawData.includes('{') || rawData.includes('[');
        assert.ok(isValidJSON, 'Raw data JSON not found or empty array not shown');
      });
});
