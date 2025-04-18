// require('dotenv').config();
// const { Builder, By, Key, until } = require('selenium-webdriver');
// const assert = require('assert');

// const baseUrl = "http://localhost:" + process.env.PORT;

// describe('Selenium Test Suite', function () {
//   this.timeout(30000); // Set a timeout for Selenium actions
//   let driver;


//   before(async () => {
//     // Set up the WebDriver
//     driver = await new Builder().forBrowser('chrome').build();
//   });

//   after(async () => {
//     // Close the WebDriver
//     await driver.quit();
//   });

//   describe('Requirement Testing', function () {
//     it('REQ-1: Home page loads with the correct title', async () => {
//       await driver.get(baseUrl);
//       const title = await driver.getTitle();
//       assert.strictEqual(title, 'SC2006 Project'); // REQ-1
//     });
  
//     it('REQ-2: Button click shows the correct result', async () => {
//       const button = await driver.findElement(By.css('button'));
//       await button.click();
//       const result = await driver.findElement(By.id('result')).getText();
//       assert.strictEqual(result, 'Expected Result'); // REQ-2
//     });
//   });
  

// //   it('should interact with an element', async () => {
// //     await driver.get('http://localhost:3001'); // Replace with your app's URL
// //     const element = await driver.findElement(By.css('button')); // Replace with your target element selector
// //     await element.click();

// //     const result = await driver.findElement(By.id('result')).getText(); // Replace with result element ID
// //     assert.strictEqual(result, 'Expected Result'); // Replace with your expected result
// //   });
// });
