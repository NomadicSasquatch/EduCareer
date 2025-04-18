import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";
import certificateController from "../../../controller/CertificateController.js";
import CertificateService from "../../../services/CertificateService.js";
import GmailService from "../../../services/GmailService.js";

const app = express();
app.use(bodyParser.json());
app.post("/certificate/email", certificateController.emailCertificate);

describe("Certificate Controller Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  it("should return 400 if any required certificate data is missing", async () => {
    const res = await request(app)
      .post("/certificate/email")
      .send({ email: "user@example.com", username: "User" });
    expect(res.status).to.equal(400);
    expect(res.body).to.deep.equal({ error: "Missing required certificate data" });
  });

  it("should email certificate successfully", async () => {
    const dummyPdfBuffer = Buffer.from("dummy pdf");
    const dummyEmailResponse = { status: "sent" };

    stub(CertificateService, "generateCertificatePdf").resolves(dummyPdfBuffer);
    stub(GmailService, "sendCertificateEmail").resolves(dummyEmailResponse);

    const certificatePayload = {
      email: "user@example.com",
      username: "User",
      course: "Course 101",
      date: "2025-04-01"
    };

    const res = await request(app)
      .post("/certificate/email")
      .send(certificatePayload);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      message: "Certificate emailed successfully",
      emailResponse: dummyEmailResponse
    });
  });

  it("should return 500 if an error occurs during certificate emailing", async () => {
    stub(CertificateService, "generateCertificatePdf").rejects(new Error("PDF error"));

    const certificatePayload = {
      email: "user@example.com",
      username: "User",
      course: "Course 101",
      date: "2025-04-01"
    };

    const res = await request(app)
      .post("/certificate/email")
      .send(certificatePayload);

    expect(res.status).to.equal(500);
    expect(res.body).to.deep.equal({ error: "Failed to email certificate" });
  });
});