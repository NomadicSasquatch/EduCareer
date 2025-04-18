// SHAWN LOOK OUT!!!!
const CertificateService = require("../services/CertificateService");
const GmailService = require("../services/GmailService");

class CertificateController {
  async emailCertificate(req, res) {
    try {
      // Expecting: { email, username, course, date } in the request body
      const { email, username, course, date } = req.body;
      if (!email || !username || !course || !date) {
        return res
          .status(400)
          .json({ error: "Missing required certificate data" });
      }

      const certificateData = { name: username, course, date };

      const pdfBuffer = await CertificateService.generateCertificatePdf(
        certificateData
      );

      const emailResponse = await GmailService.sendCertificateEmail(
        email,
        username,
        pdfBuffer,
        certificateData
      );

      return res
        .status(200)
        .json({ message: "Certificate emailed successfully", emailResponse });
    } catch (error) {
      console.error("Error in emailCertificate:", error);
      return res.status(500).json({ error: "Failed to email certificate" });
    }
  }
}

module.exports = new CertificateController();
