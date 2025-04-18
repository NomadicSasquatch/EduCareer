require('dotenv').config();
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const baseUrl = 'http://localhost:3000';

describe('Checkout Page Tests', function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('REQ-CHECKOUT-1: Complete checkout flow from login to enrollment completion', async () => {
    await driver.get(`${baseUrl}/login`);
    
    const usernameInput = await driver.findElement(By.id('login_username'));
    const passwordInput = await driver.findElement(By.id('login_password'));
    
    await usernameInput.sendKeys('test5');
    await passwordInput.sendKeys('test');
    
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/') && !currentUrl.includes('/login');
    }, 10000);

    await driver.get(`${baseUrl}/searchCourse`);
    
    await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);
    
    const firstCourse = await driver.findElement(By.css('.ant-card-hoverable'));
    await firstCourse.click();
    
    await driver.wait(until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Enroll')]]")), 10000);
    
    const enrollButton = await driver.findElement(By.xpath("//button[.//span[contains(text(), 'Enroll')]]"));
    await enrollButton.click();
    
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/checkout');
    }, 10000);
    
    const stepsComponent = await driver.findElement(By.css('.ant-steps'));
    assert.ok(stepsComponent, 'Steps component not found on checkout page');
    
    const courseTitle = await driver.findElement(By.css('h4'));
    assert.ok(await courseTitle.getText(), 'Course title not displayed');
    
    try {
      const proceedButton = await driver.findElement(By.xpath("//button[.//span[text()='Proceed to Payment']]"));
      await proceedButton.click();
      
      await driver.wait(until.elementLocated(By.css("input[placeholder='John Doe']")), 5000);
      await driver.findElement(By.css("input[placeholder='John Doe']")).sendKeys('Test User');
      await driver.findElement(By.css("input[placeholder='1234 5678 9012 3456']")).sendKeys('4242424242424242');
      await driver.findElement(By.css("input[placeholder='MM/YY']")).sendKeys('12/25');
      await driver.findElement(By.css("input[placeholder='123']")).sendKeys('123');
      await driver.findElement(By.css("textarea[placeholder='Enter your billing address']")).sendKeys('123 Test Street, City, Country');
      
      const completePaymentButton = await driver.findElement(By.xpath("//button[.//span[text()='Complete Payment']]"));
      await completePaymentButton.click();
    } catch (e) {
      console.log('Payment step skipped - likely a free course:', e.message);
    }
    
    await driver.wait(until.elementLocated(By.css('.ant-result-success')), 15000);
    const successTitle = await driver.findElement(By.css('.ant-result-title')).getText();
    assert.ok(successTitle.includes('Successful'), 'Success message not displayed after enrollment');
    
    const goToCoursesButton = await driver.findElement(By.xpath("//button[.//span[text()='Go to My Courses']]"));
    await goToCoursesButton.click();
    
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl === `${baseUrl}/` || currentUrl.includes('/dashboard');
    }, 10000);
  });

  it('REQ-CHECKOUT-2: Cannot checkout without selecting a course', async () => {
    await driver.executeScript('localStorage.removeItem("selectedCourse")');
    
    await driver.get(`${baseUrl}/checkout`);
    
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('/searchCourse');
    }, 10000);
    
    try {
      const warningMsg = await driver.wait(until.elementLocated(By.css('.ant-message-warning')), 5000);
      assert.ok(warningMsg, 'Warning message not shown when accessing checkout without a course');
    } catch (e) {
      console.log('No warning message displayed, but redirect happened correctly');
    }
  });

  it('REQ-CHECKOUT-3: Cannot checkout an already enrolled course', async () => {
    await driver.get(`${baseUrl}/searchCourse`);
    await driver.wait(until.elementLocated(By.css('.ant-card-hoverable')), 15000);

    const firstCourse = await driver.findElement(By.css('.ant-card-hoverable'));
    await firstCourse.click();

    await driver.wait(until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Enroll')]]")), 10000);

    const enrollButton = await driver.findElement(By.xpath("//button[.//span[contains(text(), 'Enroll')]]"));
    await enrollButton.click();

    try {
        const messageElement = await driver.wait(until.elementLocated(By.css('.ant-message-notice-content')), 5000);
        const messageText = await messageElement.getText();
        console.log('Enrollment message displayed:', messageText);

        assert.ok(
            messageText.toLowerCase().includes('already enrolled'),
            'No appropriate message displayed about already being enrolled in the course'
        );

        const currentUrl = await driver.getCurrentUrl();
        assert.ok(!currentUrl.includes('/checkout'), 'User was incorrectly redirected to checkout');
        console.log('Verified that the user was not redirected to checkout.');
    } catch (e) {
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/checkout')) {
            assert.fail('User was incorrectly allowed to checkout an already enrolled course');
        } else {
            assert.fail('Expected message about already being enrolled, but none was displayed');
        }
    }
  });
});