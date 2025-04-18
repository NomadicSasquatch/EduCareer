import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";
import courseEnrollmentController from "../../../controller/CourseEnrollmentController.js";
import EnrollmentModel from "../../../models/CourseEnrollmentModel.js";

const app = express();
app.use(bodyParser.json());

app.get("/courses/:courseId/enrollments", courseEnrollmentController.getAllEnrollments);
app.get("/courses/:courseId/enrollments/:enrollmentId", courseEnrollmentController.getEnrollmentById);
app.get("/courses/:courseId/enrollment-check", courseEnrollmentController.checkUserEnrollment);
app.post("/courses/:courseId/enrollments", courseEnrollmentController.createEnrollment);
app.put("/courses/:courseId/enrollments/:enrollmentId", courseEnrollmentController.updateEnrollment);
app.delete("/courses/:courseId/enrollments/:enrollmentId", courseEnrollmentController.deleteEnrollment);

describe("CourseEnrollmentController Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  describe("GET /courses/:courseId/enrollments", () => {
    it("should return all enrollments", async () => {
      const dummyEnrollments = [{ enrollment_id: 1, userId: 10 }];
      stub(EnrollmentModel, "getAll").resolves(dummyEnrollments);

      const res = await request(app).get("/courses/123/enrollments");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyEnrollments);
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "getAll").rejects(new Error("DB error"));
      const res = await request(app).get("/courses/123/enrollments");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courses/:courseId/enrollments/:enrollmentId", () => {
    it("should return enrollment by id if found", async () => {
      const dummyEnrollment = { enrollment_id: 1, userId: 10 };
      stub(EnrollmentModel, "getById").resolves(dummyEnrollment);

      const res = await request(app).get("/courses/123/enrollments/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyEnrollment);
    });

    it("should return 404 if enrollment not found", async () => {
      stub(EnrollmentModel, "getById").resolves(null);

      const res = await request(app).get("/courses/123/enrollments/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Enrollment not found" });
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "getById").rejects(new Error("DB error"));

      const res = await request(app).get("/courses/123/enrollments/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courses/:courseId/enrollment-check", () => {
    it("should return enrollment status", async () => {
      stub(EnrollmentModel, "checkUserEnrollment").resolves(true);

      const res = await request(app)
        .get("/courses/123/enrollment-check")
        .query({ userId: "10" });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ isEnrolled: true });
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "checkUserEnrollment").rejects(new Error("DB error"));

      const res = await request(app)
        .get("/courses/123/enrollment-check")
        .query({ userId: "10" });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /courses/:courseId/enrollments", () => {
    it("should create an enrollment successfully", async () => {
      const dummyEnrollment = { enrollment_id: 50 };
      stub(EnrollmentModel, "create").resolves(dummyEnrollment);
      const enrollmentData = { userId: 10, courseId: "123", status: "active" };

      const res = await request(app)
        .post("/courses/123/enrollments")
        .send(enrollmentData);

      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Enrollment created successfully",
        enrollment_id: dummyEnrollment.enrollment_id,
      });
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "create").rejects(new Error("DB error"));
      const enrollmentData = { userId: 10, courseId: "123", status: "active" };

      const res = await request(app)
        .post("/courses/123/enrollments")
        .send(enrollmentData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /courses/:courseId/enrollments/:enrollmentId", () => {
    it("should update an enrollment successfully", async () => {
      stub(EnrollmentModel, "update").resolves();
      const updateData = { status: "completed" };

      const res = await request(app)
        .put("/courses/123/enrollments/1")
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Enrollment updated successfully" });
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "update").rejects(new Error("DB error"));
      const updateData = { status: "completed" };

      const res = await request(app)
        .put("/courses/123/enrollments/1")
        .send(updateData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("DELETE /courses/:courseId/enrollments/:enrollmentId", () => {
    it("should delete an enrollment successfully", async () => {
      stub(EnrollmentModel, "delete").resolves();
      const res = await request(app).delete("/courses/123/enrollments/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Enrollment deleted successfully" });
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "delete").rejects(new Error("DB error"));
      const res = await request(app).delete("/courses/123/enrollments/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });
});