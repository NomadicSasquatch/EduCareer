require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
const loginUrl = `${baseUrl}/login`;
const providerDashboardUrl = `${baseUrl}/providerDashboard`;

async function findAndClick(driver, locator, timeout = 10_000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', el);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.click();
  return el;
}

describe('Provider Dashboard Page Tests', function () {
  this.timeout(60_000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();

    await driver.get(loginUrl);
    await driver.findElement(By.id('login_username')).sendKeys('tom');
    await driver.findElement(By.id('login_password')).sendKeys('tom');
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(async () => (await driver.getCurrentUrl()) !== loginUrl, 5_000);

    await driver.get(providerDashboardUrl);
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-PROVIDER-1: Page loads and displays dashboard header', async () => {
    const header = await driver.wait(until.elementLocated(By.css('h1')), 10_000);
    const text = await header.getText();
    assert.ok(text.includes('Provider Management Dashboard'),
              'Dashboard header not visible or incorrect');
  });

  it('REQ-PROVIDER-2: "My Courses" tab is active with course table and New Course button', async () => {
    const courseTable = await driver.wait(until.elementLocated(By.css('table')), 10_000);

    const newCourseBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(normalize-space(.), 'New Course') and (self::button or self::a)]")
      ),
      10_000
    );

    assert.ok(await courseTable.isDisplayed(), 'Course table is not visible');
    assert.ok(await newCourseBtn.isDisplayed(), 'New Course button is not visible');
  });

  it('REQ-PROVIDER-3: Clicking "Update" on a course opens the update modal', async () => {
    await findAndClick(
      driver,
      By.xpath("//*[contains(normalize-space(.), 'Update') and (self::button or self::a)]")
    );

    const modal = await driver.wait(until.elementLocated(By.css('.ant-modal')), 10_000);
    await driver.wait(until.elementIsVisible(modal), 10_000);

    const formVisible = await modal.findElement(By.css('form')).isDisplayed();
    assert.ok(formVisible, 'Update modal did not open correctly');

    await findAndClick(driver, By.css('.ant-modal-close'));
  });

  it('REQ-PROVIDER-4: "Delete" on a course triggers a confirmation dialog', async () => {
    await findAndClick(
      driver,
      By.xpath("//*[contains(@class,'ant-btn-danger') and contains(normalize-space(.), 'Delete')]")
    );

    const confirmModal = await driver.wait(until.elementLocated(By.css('.ant-modal-confirm')), 10000);
    await driver.wait(until.elementIsVisible(confirmModal), 10000);

    const titleElement = await confirmModal.findElement(By.css('.ant-modal-confirm-title'));
    const titleText = await titleElement.getText();
    assert.ok(
      titleText.includes('Are you sure you want to delete this course?'),
      'Confirmation dialog not shown'
    );
  
    const cancelBtn = await confirmModal.findElement(By.xpath(".//button[contains(., 'Cancel')]"));
    await driver.executeScript("arguments[0].click();", cancelBtn);
    await driver.wait(until.stalenessOf(confirmModal), 10000);
  });
  
  it('REQ-PROVIDER-5: "Enrollments" tab displays the enrollments table with Remove Learner actions', async () => {
    await driver.wait(async () => {
      const overlays = await driver.findElements(By.css('.ant-modal-wrap'));
      if (overlays.length === 0) return true;
      return (await Promise.all(overlays.map(async (overlay) => !(await overlay.isDisplayed())))).every(v => v);
    }, 10000);
  
    await findAndClick(
      driver,
      By.xpath("//div[contains(@class,'ant-tabs-tab') and contains(normalize-space(.), 'Enrollments')]")
    );
  
    await driver.wait(until.elementLocated(By.css('table')), 10000);
    const rows = await driver.findElements(By.css('table tbody tr'));
  
    if (rows.length > 0) {
      const removeBtn = await driver.wait(
        until.elementLocated(
          By.xpath("//*[contains(normalize-space(.), 'Remove Learner') and (self::button or self::a)]")
        ),
        10000
      );
      await driver.executeScript("arguments[0].click();", removeBtn);
      assert.ok(await removeBtn.isDisplayed(), 'Remove Learner button not visible in enrollment row');
    } else {
      console.log('No enrollments found — skipping Remove Learner button test.');
    }
  });
});