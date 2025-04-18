import { expect } from "chai";
import { stub, restore } from "sinon";
import courseEnrollmentController from "../../../controller/CourseEnrollmentController.js";
import EnrollmentModel from "../../../models/CourseEnrollmentModel.js";

describe("CourseEnrollmentController Whitebox Tests", () => {
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

  describe("getAllEnrollments", () => {
    it("should return all enrollments with status 200", async () => {
      const dummyEnrollments = [{ enrollment_id: 1, userId: 10 }];
      stub(EnrollmentModel, "getAll").resolves(dummyEnrollments);

      await courseEnrollmentController.getAllEnrollments(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyEnrollments)).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "getAll").rejects(new Error("DB error"));

      await courseEnrollmentController.getAllEnrollments(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getEnrollmentById", () => {
    it("should return enrollment data if found", async () => {
      const dummyEnrollment = { enrollment_id: 1, userId: 10 };
      req.params.enrollmentId = "1";
      stub(EnrollmentModel, "getById").resolves(dummyEnrollment);

      await courseEnrollmentController.getEnrollmentById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyEnrollment)).to.be.true;
    });

    it("should return 404 if enrollment not found", async () => {
      req.params.enrollmentId = "1";
      stub(EnrollmentModel, "getById").resolves(null);

      await courseEnrollmentController.getEnrollmentById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Enrollment not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.enrollmentId = "1";
      stub(EnrollmentModel, "getById").rejects(new Error("DB error"));

      await courseEnrollmentController.getEnrollmentById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("checkUserEnrollment", () => {
    it("should return enrollment status", async () => {
      req.params.courseId = "123";
      req.query.userId = "10";
      stub(EnrollmentModel, "checkUserEnrollment").resolves(true);

      await courseEnrollmentController.checkUserEnrollment(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ isEnrolled: true })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.courseId = "123";
      req.query.userId = "10";
      stub(EnrollmentModel, "checkUserEnrollment").rejects(new Error("DB error"));

      await courseEnrollmentController.checkUserEnrollment(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("createEnrollment", () => {
    it("should create an enrollment and return 201", async () => {
      const dummyEnrollment = { enrollment_id: 50 };
      stub(EnrollmentModel, "create").resolves(dummyEnrollment);
      req.body = { userId: 10, courseId: "123", status: "active" };

      await courseEnrollmentController.createEnrollment(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: "Enrollment created successfully",
        enrollment_id: dummyEnrollment.enrollment_id
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(EnrollmentModel, "create").rejects(new Error("DB error"));
      req.body = { userId: 10, courseId: "123", status: "active" };

      await courseEnrollmentController.createEnrollment(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateEnrollment", () => {
    it("should update an enrollment and return 200", async () => {
      req.params.enrollmentId = "1";
      req.body = { status: "completed" };
      stub(EnrollmentModel, "update").resolves();

      await courseEnrollmentController.updateEnrollment(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Enrollment updated successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.enrollmentId = "1";
      req.body = { status: "completed" };
      stub(EnrollmentModel, "update").rejects(new Error("DB error"));

      await courseEnrollmentController.updateEnrollment(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("deleteEnrollment", () => {
    it("should delete an enrollment and return 200", async () => {
      req.params.enrollmentId = "1";
      stub(EnrollmentModel, "delete").resolves();

      await courseEnrollmentController.deleteEnrollment(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Enrollment deleted successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.enrollmentId = "1";
      stub(EnrollmentModel, "delete").rejects(new Error("DB error"));

      await courseEnrollmentController.deleteEnrollment(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });
});