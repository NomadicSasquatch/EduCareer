import { expect } from "chai";
import { stub, restore } from "sinon";
import courseReviewController from "../../../controller/CourseReviewController.js";
import CourseReviewModel from "../../../models/CourseReviewModel.js";

describe("CourseReviewController Whitebox Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      status: stub().returnsThis(),
      json: stub()
    };
  });

  afterEach(() => {
    restore();
  });

  describe("getAllReviewsForCourse", () => {
    it("should return reviews for a course with status 200", async () => {
      const dummyReviews = [{ review_id: 1, rating: 5 }];
      stub(CourseReviewModel, "getReviews").resolves(dummyReviews);
      req.params.courseId = "100";
      req.query.externalReferenceNumber = "ext-123";

      await courseReviewController.getAllReviewsForCourse(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyReviews)).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "getReviews").rejects(new Error("DB error"));
      req.params.courseId = "100";
      req.query.externalReferenceNumber = "ext-123";

      await courseReviewController.getAllReviewsForCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getReviewById", () => {
    it("should return review data if found", async () => {
      const dummyReview = { review_id: 1, rating: 5, comment: "Excellent" };
      req.params.reviewId = "1";
      stub(CourseReviewModel, "getById").resolves(dummyReview);

      await courseReviewController.getReviewById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyReview)).to.be.true;
    });

    it("should return 404 if review not found", async () => {
      req.params.reviewId = "1";
      stub(CourseReviewModel, "getById").resolves(null);

      await courseReviewController.getReviewById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Review not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.reviewId = "1";
      stub(CourseReviewModel, "getById").rejects(new Error("DB error"));

      await courseReviewController.getReviewById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("createReview", () => {
    it("should create a review and return 201", async () => {
      const dummyResult = { reviewId: 10 };
      stub(CourseReviewModel, "createReview").resolves(dummyResult);
      req.params.courseId = "100";
      req.body = {
        rating: 5,
        comment: "Great course",
        userId: 20,
        externalReferenceNumber: "ext-456"
      };

      await courseReviewController.createReview(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: "Review created successfully",
        reviewId: dummyResult.reviewId
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseReviewModel, "createReview").rejects(new Error("DB error"));
      req.params.courseId = "100";
      req.body = {
        rating: 5,
        comment: "Great course",
        userId: 20,
        externalReferenceNumber: "ext-456"
      };

      await courseReviewController.createReview(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateReview", () => {
    it("should update a review and return 200", async () => {
      req.params.reviewId = "1";
      req.body = { rating: 4, comment: "Good course" };
      stub(CourseReviewModel, "updateReview").resolves();

      await courseReviewController.updateReview(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Review updated successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.reviewId = "1";
      req.body = { rating: 4, comment: "Good course" };
      stub(CourseReviewModel, "updateReview").rejects(new Error("DB error"));

      await courseReviewController.updateReview(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("deleteReview", () => {
    it("should delete a review and return 200", async () => {
      req.params.reviewId = "1";
      stub(CourseReviewModel, "deleteReview").resolves();

      await courseReviewController.deleteReview(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Review deleted successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.reviewId = "1";
      stub(CourseReviewModel, "deleteReview").rejects(new Error("DB error"));

      await courseReviewController.deleteReview(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });
});