// // SELENIUM
// require("dotenv").config(); // Load environment variables
// const { Builder, By, until } = require("selenium-webdriver");
// const assert = require("assert");

// describe("HomePage Tests", function () {
//   this.timeout(30000); // Timeout for all tests

//   let driver;

//   before(async () => {
//     driver = await new Builder().forBrowser("chrome").build(); // Start WebDriver
//   });

//   after(async () => {
//     await driver.quit(); // Close WebDriver after all tests
//   });
//   const baseUrl = "http://localhost:" + process.env.REACT_APP_TESTING_PORT;

//   describe("Requirement Testing", function () {
//     it("TEST-1.1: Home page loads with the correct title", async () => {
//       await driver.get(baseUrl);
//       const title = await driver.getTitle();
//       console.log(title);
//       assert.strictEqual(title, "SC2006 Project");
//     });
//   });

//   /**
//    * Test Hero Section
//    */
//   describe("Hero Section", () => {
//     beforeEach(async () => {
//       await driver.get(baseUrl); // Navigate to HomePage
//     });

//     it("should display the hero title", async () => {
//       const heroTitle = await driver.findElement(By.css("div > h1")).getText(); // Adjust selector as per your code
//       assert.strictEqual(heroTitle, "Welcome to Our Platform");
//     });

//     it("should display the hero subtitle", async () => {
//       const heroSubtitle = await driver
//         .findElement(By.css("div > p"))
//         .getText();
//       assert.strictEqual(
//         heroSubtitle,
//         "Join us today and enjoy exclusive benefits."
//       );
//     });

//     it("should have working Sign Up button", async () => {
//       const signUpButton = await driver.findElement(
//         By.xpath("//*[@id='root']/div/main/div/div[1]/div/button[1]/span")
//       );
//       assert(signUpButton.isDisplayed());
//     });

//     it("should have working Learn More button", async () => {
//       const learnMoreButton = await driver.findElement(
//         By.xpath("//button[contains(text(), 'Learn More')]")
//       );
//       assert(learnMoreButton.isDisplayed());
//     });
//   });

//   /**
//    * Test Top Seller Section
//    */
//   describe("Top Seller Section", () => {
//     beforeEach(async () => {
//       await driver.get(baseUrl);
//     });

//     it("should display the Top Seller title", async () => {
//       const topSellerTitle = await driver
//         .findElement(
//           By.xpath("//h1[contains(text(),'Check Out Our Top Seller')]")
//         )
//         .getText();
//       assert.strictEqual(topSellerTitle, "Check Out Our Top Seller");
//     });

//     it("should display a carousel with visible cards", async () => {
//       const carousel = await driver.findElement(By.css(".ant-carousel"));
//       assert(carousel.isDisplayed());
//     });

//     it("should display visible cards in the carousel", async () => {
//       const visibleCards = await driver.findElements(
//         By.css(".ant-carousel .ant-col")
//       ); // Ensure this matches the visible card selector
//       assert(visibleCards.length > 0, "No visible cards found in the carousel");
//     });
//   });

//   /**
//    * Test Why Join Us Section
//    */
//   describe("Why Join Us Section", () => {
//     beforeEach(async () => {
//       await driver.get(baseUrl);
//     });

//     it("should display Why Join Us section", async () => {
//       const whyJoinUs = await driver.findElement(
//         By.xpath("//h3[contains(text(),'Why Join Us?')]")
//       );
//       assert(whyJoinUs.isDisplayed());
//     });

//     it("should display Get Started Today section", async () => {
//       const getStartedToday = await driver.findElement(
//         By.xpath("//h3[contains(text(),'Get Started Today')]")
//       );
//       assert(getStartedToday.isDisplayed());
//     });
//   });
// });
