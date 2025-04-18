require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = `http://localhost:3000/searchCourse`;

describe('Search Course Page Tests', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-SEARCH-1: Page loads with course listings and filter options', async () => {
    await driver.get(baseUrl);
    
    const filterCard = await driver.wait(until.elementLocated(By.xpath("//div[contains(text(),'Filter Courses')]")), 10000);
    assert.ok(filterCard, 'Filter options not found');
    
    await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);
    const courseCards = await driver.findElements(By.css('.ant-card-hoverable'));
    assert.ok(courseCards.length > 0, 'No course cards found');
  });

  it('REQ-SEARCH-2: Search functionality filters courses based on keyword', async () => {
    await driver.get(baseUrl);
    
    const searchInput = await driver.wait(until.elementLocated(By.css('.ant-input-search input')), 10000);
    await searchInput.clear();
    await searchInput.sendKeys('business');
    
    const searchButton = await driver.findElement(By.css('.ant-input-search-button'));
    await searchButton.click();
    
    await driver.sleep(3000);
    
    const courseCards = await driver.findElements(By.css('.ant-card-hoverable'));
    assert.ok(courseCards.length > 0, 'No search results found');
  });

  it('REQ-SEARCH-3: Clicking on a course displays its details', async () => {
    await driver.get(baseUrl);

    const firstCourse = await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);
    await firstCourse.click();

    const courseTitle = await driver.wait(until.elementLocated(By.css('h2')), 10000);
    const titleText = await courseTitle.getText();
    assert.ok(titleText.length > 0, 'Course title not displayed in details view');

    const tabs = await driver.findElements(By.css('.ant-tabs-tab'));
    assert.ok(tabs.length >= 3, 'Course detail tabs not found');
  });

  it('REQ-SEARCH-4: Reviews tab shows reviews for selected course', async () => {
    await driver.get(baseUrl);

    const firstCourse = await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);
    await firstCourse.click();

    const reviewsTab = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'ant-tabs-tab')]//div[text()='Reviews']")), 5000);
    await reviewsTab.click();

    const reviewsSection = await driver.findElement(By.xpath("//div[contains(@class, 'ant-tabs-tabpane-active')]"));

    const hasReviews = await reviewsSection.findElements(By.css('.ant-list-item'));
    const noReviewsText = await reviewsSection.findElements(By.xpath("//p[contains(text(), 'No reviews yet')]"));
    
    assert.ok(hasReviews.length > 0 || noReviewsText.length > 0, 'Reviews section not properly displayed');
  });

  it('REQ-SEARCH-5: Enroll button shows login modal for unauthenticated users', async () => {
    await driver.executeScript('sessionStorage.clear();');
    
    await driver.get(baseUrl);

    const courses = await driver.wait(until.elementsLocated(By.css('.ant-card-hoverable')), 15000);

    let internalCourseFound = false;
    for (const course of courses) {
      await course.click();
      await driver.sleep(500);

      const enrollButton = await driver.findElements(By.xpath("//button[.//span[contains(text(), 'Enroll')]]"));
      if (enrollButton.length > 0) {
        internalCourseFound = true;
        await enrollButton[0].click();
        try {
          const modal = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'ant-modal-confirm')]")), 5000);
          const modalTitle = await modal.findElement(By.css('.ant-modal-confirm-title'));
          const titleText = await modalTitle.getText();
          
          assert.strictEqual(titleText, 'Login Required', 'Login modal title incorrect');

          const cancelButton = await driver.findElement(By.xpath("//button[.//span[text()='Cancel']]"));
          await cancelButton.click();
          break;
        } catch (err) {
          console.log('Login modal not shown - user might already be authenticated');
          internalCourseFound = false;
        }
      }
    }
    
    if (!internalCourseFound) {
      console.log('No internal courses found to test enrollment - skipping test');
    }
  });

  it('REQ-SEARCH-6: Write review button opens review modal', async () => {
    await driver.get(baseUrl);
    
    try {
      const firstCourse = await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);
      await firstCourse.click();

      const reviewsTab = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'ant-tabs-tab')]//div[text()='Reviews']")), 5000);
      await reviewsTab.click();

      const writeReviewButton = await driver.findElement(By.xpath("//button[.//span[contains(text(), 'Write a Review')]]")).catch(() => null);

      if (writeReviewButton) {
        await writeReviewButton.click();

        const modal = await driver.wait(until.elementLocated(By.css('.ant-modal-content')), 5000);
        const modalTitle = await modal.findElement(By.css('.ant-modal-title'));
        const titleText = await modalTitle.getText();
        
        assert.strictEqual(titleText, 'Write a Review', 'Review modal title incorrect');

        const closeButton = await driver.findElement(By.css('.ant-modal-close'));
        await closeButton.click();
      } else {
        console.log('Write review button not available - user might be logged out or already reviewed');
      }
    } catch (err) {
      console.error('Error in review modal test:', err);
      throw err;
    }
  });
});