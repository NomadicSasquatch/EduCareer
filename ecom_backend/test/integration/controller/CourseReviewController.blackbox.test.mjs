import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";
import courseReviewController from "../../../controller/CourseReviewController.js";
import CourseReviewModel from "../../../models/CourseReviewModel.js";

const app = express();
app.use(bodyParser.json());

app.get("/courses/:courseId/reviews", courseReviewController.getAllReviewsForCourse);
app.get("/courses/reviews", courseReviewController.getAllReviewsForCourse);
app.get("/courses/:courseId/reviews/:reviewId", courseReviewController.getReviewById);
app.post("/courses/:courseId/reviews", courseReviewController.createReview);
app.post("/courses/reviews", courseReviewController.createReview);
app.put("/courses/reviews/:reviewId", courseReviewController.updateReview);
app.delete("/courses/reviews/:reviewId", courseReviewController.deleteReview);

describe("CourseReviewController Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  describe("GET /courses/:courseId/reviews", () => {
    it("should return reviews for the given course (with query)", async () => {
      const dummyReviews = [{ reviewId: 1, rating: 5 }];
      stub(CourseReviewModel, "getReviews").resolves(dummyReviews);

      const res = await request(app)
        .get("/courses/100/reviews")
        .query({ externalReferenceNumber: "abc123" });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyReviews);
    });

    it("should return reviews using the /courses/reviews endpoint", async () => {
      const dummyReviews = [{ reviewId: 2, rating: 4 }];
      stub(CourseReviewModel, "getReviews").resolves(dummyReviews);

      const res = await request(app)
        .get("/courses/reviews")
        .query({ courseId: "100", externalReferenceNumber: "xyz789" });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyReviews);
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "getReviews").rejects(new Error("DB error"));

      const res = await request(app)
        .get("/courses/100/reviews")
        .query({ externalReferenceNumber: "abc123" });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courses/:courseId/reviews/:reviewId", () => {
    it("should return review data if found", async () => {
      const dummyReview = { reviewId: 1, rating: 5, comment: "Great!" };
      stub(CourseReviewModel, "getById").resolves(dummyReview);

      const res = await request(app).get("/courses/100/reviews/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyReview);
    });

    it("should return 404 if review is not found", async () => {
      stub(CourseReviewModel, "getById").resolves(null);

      const res = await request(app).get("/courses/100/reviews/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Review not found" });
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "getById").rejects(new Error("DB error"));

      const res = await request(app).get("/courses/100/reviews/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /courses/:courseId/reviews", () => {
    it("should create a review successfully using courseId in path", async () => {
      const dummyResult = { reviewId: 10 };
      stub(CourseReviewModel, "createReview").resolves(dummyResult);
      const reviewData = {
        rating: 5,
        comment: "Excellent course",
        userId: 20,
        externalReferenceNumber: "ext-001"
      };

      const res = await request(app)
        .post("/courses/100/reviews")
        .send(reviewData);
      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Review created successfully",
        reviewId: dummyResult.reviewId
      });
    });

    it("should create a review successfully using /courses/reviews endpoint", async () => {
      const dummyResult = { reviewId: 11 };
      stub(CourseReviewModel, "createReview").resolves(dummyResult);
      const reviewData = {
        rating: 4,
        comment: "Good course",
        userId: 30,
        externalReferenceNumber: "ext-002"
      };

      const res = await request(app)
        .post("/courses/reviews")
        .send(reviewData);
      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Review created successfully",
        reviewId: dummyResult.reviewId
      });
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "createReview").rejects(new Error("DB error"));
      const reviewData = {
        rating: 4,
        comment: "Good course",
        userId: 30,
        externalReferenceNumber: "ext-002"
      };

      const res = await request(app)
        .post("/courses/100/reviews")
        .send(reviewData);
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /courses/reviews/:reviewId", () => {
    it("should update a review successfully", async () => {
      stub(CourseReviewModel, "updateReview").resolves();
      const updateData = { rating: 3, comment: "Average course" };

      const res = await request(app)
        .put("/courses/reviews/1")
        .send(updateData);
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Review updated successfully" });
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "updateReview").rejects(new Error("DB error"));
      const updateData = { rating: 3, comment: "Average course" };

      const res = await request(app)
        .put("/courses/reviews/1")
        .send(updateData);
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("DELETE /courses/reviews/:reviewId", () => {
    it("should delete a review successfully", async () => {
      stub(CourseReviewModel, "deleteReview").resolves();
      const res = await request(app).delete("/courses/reviews/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Review deleted successfully" });
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "deleteReview").rejects(new Error("DB error"));
      const res = await request(app).delete("/courses/reviews/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });
});