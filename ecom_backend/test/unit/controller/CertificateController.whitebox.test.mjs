import { expect } from "chai";
import { stub, restore } from "sinon";
import certificateController from "../../../controller/CertificateController.js";
import CertificateService from "../../../services/CertificateService.js";
import GmailService from "../../../services/GmailService.js";

describe("Certificate Controller Whitebox Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: stub().returnsThis(),
      json: stub()
    };
  });

  afterEach(() => {
    restore();
  });

  describe("emailCertificate", () => {
    it("should return 400 if required certificate data is missing", async () => {
      req.body = { email: "user@example.com", username: "User" };
      await certificateController.emailCertificate(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Missing required certificate data" })).to.be.true;
    });

    it("should email certificate successfully", async () => {
      const dummyPdfBuffer = Buffer.from("dummy pdf");
      const dummyEmailResponse = { status: "sent" };

      req.body = {
        email: "user@example.com",
        username: "User",
        course: "Course 101",
        date: "2025-04-01"
      };

      stub(CertificateService, "generateCertificatePdf").resolves(dummyPdfBuffer);
      stub(GmailService, "sendCertificateEmail").resolves(dummyEmailResponse);

      await certificateController.emailCertificate(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        message: "Certificate emailed successfully",
        emailResponse: dummyEmailResponse
      })).to.be.true;
    });

    it("should return 500 if an error occurs during certificate emailing", async () => {
      req.body = {
        email: "user@example.com",
        username: "User",
        course: "Course 101",
        date: "2025-04-01"
      };

      stub(CertificateService, "generateCertificatePdf").rejects(new Error("Test error"));

      await certificateController.emailCertificate(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Failed to email certificate" })).to.be.true;
    });
  });
});