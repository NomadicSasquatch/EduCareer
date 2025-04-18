import { expect } from "chai";
import { stub, restore } from "sinon";
import feedbackController from "../../../controller/ContactFeedbackController.js";
import FeedbackModel from "../../../models/FeedbackModel.js";

describe("Feedback Controller Whitebox Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: stub().returnsThis(),
      json: stub(),
    };
  });

  afterEach(() => {
    restore();
  });

  describe("getAllFeedback", () => {
    it("should return all feedback", async () => {
      const dummyFeedback = [{ id: 1, comment: "Test comment" }];
      stub(FeedbackModel, "getAll").resolves(dummyFeedback);

      await feedbackController.getAllFeedback(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyFeedback)).to.be.true;
    });

    it("should return 500 if an error occurs", async () => {
      stub(FeedbackModel, "getAll").rejects(new Error("DB error"));

      await feedbackController.getAllFeedback(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getFeedbackById", () => {
    it("should return feedback if found", async () => {
      const dummyFeedback = { id: 1, comment: "Test comment" };
      req.params.id = "1";
      stub(FeedbackModel, "getById").resolves(dummyFeedback);

      await feedbackController.getFeedbackById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyFeedback)).to.be.true;
    });

    it("should return 404 if feedback not found", async () => {
      req.params.id = "1";
      stub(FeedbackModel, "getById").resolves(null);

      await feedbackController.getFeedbackById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Feedback not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      stub(FeedbackModel, "getById").rejects(new Error("DB error"));

      await feedbackController.getFeedbackById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("createFeedback", () => {
    it("should create feedback and return the inserted id", async () => {
      req.body = { comment: "Test comment" };
      stub(FeedbackModel, "create").resolves(42);

      await feedbackController.createFeedback(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        message: "Feedback submitted successfully",
        feedbackId: 42,
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.body = { comment: "Test comment" };
      stub(FeedbackModel, "create").rejects(new Error("DB error"));

      await feedbackController.createFeedback(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateFeedback", () => {
    it("should update feedback successfully", async () => {
      req.params.id = "1";
      req.body = { comment: "Updated comment" };
      stub(FeedbackModel, "update").resolves();

      await feedbackController.updateFeedback(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Feedback updated successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      req.body = { comment: "Updated comment" };
      stub(FeedbackModel, "update").rejects(new Error("DB error"));

      await feedbackController.updateFeedback(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("deleteFeedback", () => {
    it("should delete feedback successfully", async () => {
      req.params.id = "1";
      stub(FeedbackModel, "delete").resolves();

      await feedbackController.deleteFeedback(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Feedback deleted successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      stub(FeedbackModel, "delete").rejects(new Error("DB error"));

      await feedbackController.deleteFeedback(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });
});
