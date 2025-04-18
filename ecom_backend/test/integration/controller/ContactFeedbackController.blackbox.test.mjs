import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";
import feedbackController from "../../../controller/ContactFeedbackController.js";
import FeedbackModel from "../../../models/FeedbackModel.js";

const app = express();
app.use(bodyParser.json());
app.get("/contactusfeedback", feedbackController.getAllFeedback);
app.get("/contactusfeedback/:id", feedbackController.getFeedbackById);
app.post("/contactusfeedback", feedbackController.createFeedback);
app.put("/contactusfeedback/:id", feedbackController.updateFeedback);
app.delete("/contactusfeedback/:id", feedbackController.deleteFeedback);

describe("Feedback Controller Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  describe("GET /contactusfeedback", () => {
    it("should return all feedback", async () => {
      const dummyFeedback = [{ id: 1, comment: "Great service!" }];
      stub(FeedbackModel, "getAll").resolves(dummyFeedback);

      const res = await request(app).get("/contactusfeedback");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyFeedback);
    });

    it("should return 500 if an error occurs", async () => {
      stub(FeedbackModel, "getAll").rejects(new Error("DB error"));

      const res = await request(app).get("/contactusfeedback");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /contactusfeedback/:id", () => {
    it("should return feedback by id", async () => {
      const dummyFeedback = { id: 1, comment: "Excellent!" };
      stub(FeedbackModel, "getById").resolves(dummyFeedback);

      const res = await request(app).get("/contactusfeedback/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyFeedback);
    });

    it("should return 404 if feedback is not found", async () => {
      stub(FeedbackModel, "getById").resolves(null);

      const res = await request(app).get("/contactusfeedback/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Feedback not found" });
    });

    it("should return 500 on error", async () => {
      stub(FeedbackModel, "getById").rejects(new Error("DB error"));

      const res = await request(app).get("/contactusfeedback/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /contactusfeedback", () => {
    it("should create feedback successfully", async () => {
      stub(FeedbackModel, "create").resolves(123);
      const feedbackData = { comment: "Loved it!" };

      const res = await request(app)
        .post("/contactusfeedback")
        .send(feedbackData);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        message: "Feedback submitted successfully",
        feedbackId: 123,
      });
    });

    it("should return 500 on error", async () => {
      stub(FeedbackModel, "create").rejects(new Error("DB error"));
      const feedbackData = { comment: "Loved it!" };

      const res = await request(app)
        .post("/contactusfeedback")
        .send(feedbackData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /contactusfeedback/:id", () => {
    it("should update feedback successfully", async () => {
      stub(FeedbackModel, "update").resolves();
      const updateData = { comment: "Updated comment" };

      const res = await request(app)
        .put("/contactusfeedback/1")
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Feedback updated successfully" });
    });

    it("should return 500 on error", async () => {
      stub(FeedbackModel, "update").rejects(new Error("DB error"));
      const updateData = { comment: "Updated comment" };

      const res = await request(app)
        .put("/contactusfeedback/1")
        .send(updateData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("DELETE /contactusfeedback/:id", () => {
    it("should delete feedback successfully", async () => {
      stub(FeedbackModel, "delete").resolves();

      const res = await request(app).delete("/contactusfeedback/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Feedback deleted successfully" });
    });

    it("should return 500 on error", async () => {
      stub(FeedbackModel, "delete").rejects(new Error("DB error"));

      const res = await request(app).delete("/contactusfeedback/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });
});