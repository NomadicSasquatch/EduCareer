const puppeteer = require("puppeteer");
const fs = require("fs");

async function generateCertificatePdf(data) {
  // Launch puppeteer with recommended options
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Emulate screen media to load proper CSS
  await page.emulateMediaType("screen");

  const htmlContent = `
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .certificate { border: 5px solid #333; padding: 50px; }
        h1 { font-size: 50px; }
        p { font-size: 20px; }
        .cursive { font-family: 'Dancing Script', cursive; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <h3>EduCareer</h3>
        <h1 class="cursive">Certificate of Completion</h1>
        <p>This is to certify that</p>
        <h2><u>${data.name}</u></h2>  
        <p>has successfully completed the course:</p>
        <h3>${data.course}</h3>
        <p>Date: ${data.date}</p>
      </div>
    </body>
  </html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.waitForSelector(".certificate", { timeout: 10000 });
  await page.emulateMediaType("screen");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });

  console.log("PDF Buffer Length:", pdfBuffer.length);

  await browser.close();
  return pdfBuffer;
}

// (async () => {
//   const certificateData = {
//     name: "John Doe",
//     course: "Advanced Node.js",
//     date: "March 11, 2025",
//   };

//   try {
//     const pdfBuffer = await generateCertificatePdf(certificateData);
//     fs.writeFileSync("certificate.pdf", pdfBuffer);
//     console.log("Certificate PDF generated successfully!");
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//   }
// })();

module.exports = { generateCertificatePdf };
