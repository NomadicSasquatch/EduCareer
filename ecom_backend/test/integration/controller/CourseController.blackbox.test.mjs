import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";
import courseController from "../../../controller/CourseController.js";
import CourseModel from "../../../models/CourseModel.js";

const app = express();
app.use(bodyParser.json());
app.get("/getAllCourses", courseController.getAllCourses);
app.get("/getCourse/:id", courseController.getCourseById);
app.post("/createCourse", courseController.createCourse);
app.put("/updateCourse/:id", courseController.updateCourse);
app.delete("/deleteCourse/:id", courseController.deleteCourse);
app.get("/providerCourses", courseController.getProviderCourses);
app.get("/courseEnrolledStudents", courseController.getEnrolledStudentsForCourse);
app.get("/providerEnrollments", courseController.getEnrolledStudentsForProvider);
app.post("/courseModule", courseController.addCourseModule);
app.get("/courseModules", courseController.getCourseModules);
app.put("/courseModule/:module_id", courseController.updateCourseModule);

describe("Course Controller Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  describe("GET /getAllCourses", () => {
    it("should return courses filtered by keyword", async () => {
      const dummyCourses = [{ course_id: 1, creator_id: 10, title: "Test Course" }];
      stub(CourseModel, "getAll").resolves(dummyCourses);

      const res = await request(app).get("/getAllCourses?keyword=Test");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ data: dummyCourses });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getAll").rejects(new Error("DB error"));

      const res = await request(app).get("/getAllCourses");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /getCourse/:id", () => {
    it("should return course data if found", async () => {
      const dummyCourse = { course_id: 1, title: "Test Course" };
      stub(CourseModel, "getById").resolves(dummyCourse);

      const res = await request(app).get("/getCourse/1");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ courseData: dummyCourse });
    });

    it("should return 404 if course not found", async () => {
      stub(CourseModel, "getById").resolves(null);

      const res = await request(app).get("/getCourse/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Course not found" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getById").rejects(new Error("DB error"));

      const res = await request(app).get("/getCourse/1");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /createCourse", () => {
    it("should create a course successfully", async () => {
      stub(CourseModel, "create").resolves({ course_id: 101, creator_id: 10 });
      const courseData = { title: "New Course", description: "Course description" };

      const res = await request(app)
        .post("/createCourse")
        .send(courseData);

      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Course created successfully",
        data: { courseId: 101 }
      });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "create").rejects(new Error("DB error"));
      const courseData = { title: "New Course" };

      const res = await request(app)
        .post("/createCourse")
        .send(courseData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /updateCourse/:id", () => {
    it("should update a course successfully", async () => {
      stub(CourseModel, "update").resolves();
      const updateData = { title: "Updated Course Title" };

      const res = await request(app)
        .put("/updateCourse/1")
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Course updated successfully" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "update").rejects(new Error("DB error"));
      const updateData = { title: "Updated Course Title" };

      const res = await request(app)
        .put("/updateCourse/1")
        .send(updateData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("DELETE /deleteCourse/:id", () => {
    it("should return 400 if creator_id is missing", async () => {
      const res = await request(app).delete("/deleteCourse/1");
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "creator_id is required" });
    });

    it("should delete a course successfully", async () => {
      stub(CourseModel, "delete").resolves(true);
      const res = await request(app)
        .delete("/deleteCourse/1")
        .query({ creator_id: 10 });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Course deleted successfully" });
    });

    it("should return 404 if course not found or not authorized", async () => {
      stub(CourseModel, "delete").resolves(false);
      const res = await request(app)
        .delete("/deleteCourse/1")
        .query({ creator_id: 10 });

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        error: "Course not found or you are not authorized to delete it"
      });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "delete").rejects(new Error("DB error"));
      const res = await request(app)
        .delete("/deleteCourse/1")
        .query({ creator_id: 10 });

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /providerCourses", () => {
    it("should return provider courses when creator_id is provided", async () => {
      const dummyCourses = [{ course_id: 1, creator_id: 10, name: "Provider Course" }];
      stub(CourseModel, "getProviderCourses").resolves(dummyCourses);

      const res = await request(app)
        .get("/providerCourses")
        .query({ id: 10 });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ data: dummyCourses });
    });

    it("should return 400 if creator_id is missing", async () => {
      const res = await request(app).get("/providerCourses");
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "creator_id is required" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getProviderCourses").rejects(new Error("DB error"));
      const res = await request(app)
        .get("/providerCourses")
        .query({ id: 10 });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courseEnrolledStudents", () => {
    it("should return enrolled students for a course", async () => {
      const dummyStudents = [{ student_id: 1, name: "Student A" }];
      stub(CourseModel, "getEnrolledStudentsForCourse").resolves(dummyStudents);

      const res = await request(app)
        .get("/courseEnrolledStudents")
        .query({ courseId: 1 });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ data: dummyStudents });
    });

    it("should return 400 if courseId is missing", async () => {
      const res = await request(app)
        .get("/courseEnrolledStudents")
        .query({});
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "course_id is required" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getEnrolledStudentsForCourse").rejects(new Error("DB error"));
      const res = await request(app)
        .get("/courseEnrolledStudents")
        .query({ courseId: 1 });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /providerEnrollments", () => {
    it("should return enrolled students for provider", async () => {
      const dummyStudents = [{ student_id: 1, name: "Student A" }];
      stub(CourseModel, "getEnrolledStudentsForProvider").resolves(dummyStudents);

      const res = await request(app)
        .get("/providerEnrollments")
        .query({ creator_id: 10 });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ data: dummyStudents });
    });

    it("should return 400 if creator_id is missing", async () => {
      const res = await request(app).get("/providerEnrollments");
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "creator_id is required" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getEnrolledStudentsForProvider").rejects(new Error("DB error"));
      const res = await request(app)
        .get("/providerEnrollments")
        .query({ creator_id: 10 });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /courseModule", () => {
    it("should add a course module successfully", async () => {
      const dummyModuleResult = { module_id: 555 };
      stub(CourseModel, "addModule").resolves(dummyModuleResult);

      const moduleData = { course_id: 1, title: "New Module" };
      const res = await request(app)
        .post("/courseModule")
        .send(moduleData);

      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Course module added successfully!",
        module_id: dummyModuleResult.module_id
      });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "addModule").rejects(new Error("DB error"));
      const moduleData = { course_id: 1, title: "New Module" };
      const res = await request(app)
        .post("/courseModule")
        .send(moduleData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courseModules", () => {
    it("should return course modules", async () => {
      const dummyModules = [{ module_id: 1, title: "Module 1" }];
      stub(CourseModel, "getModules").resolves(dummyModules);

      const res = await request(app)
        .get("/courseModules")
        .query({ course_id: "1" });
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ data: dummyModules });
    });

    it("should return 400 if course_id is missing", async () => {
      const res = await request(app).get("/courseModules").query({});
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "course_id is required" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getModules").rejects(new Error("DB error"));
      const res = await request(app)
        .get("/courseModules")
        .query({ course_id: "1" });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /courseModule/:module_id", () => {
    it("should update a course module successfully", async () => {
      stub(CourseModel, "updateModule").resolves(true);
      const updateData = { title: "Updated Module" };

      const res = await request(app)
        .put("/courseModule/123")
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Module updated successfully" });
    });

    it("should return 404 if module not found or not updated", async () => {
      stub(CourseModel, "updateModule").resolves(false);
      const updateData = { title: "Updated Module" };

      const res = await request(app)
        .put("/courseModule/123")
        .send(updateData);

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Module not found or not updated" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "updateModule").rejects(new Error("DB error"));
      const updateData = { title: "Updated Module" };

      const res = await request(app)
        .put("/courseModule/123")
        .send(updateData);

      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });
});