import { expect } from "chai";
import { stub, restore } from "sinon";
import courseController from "../../../controller/CourseController.js";
import CourseModel from "../../../models/CourseModel.js";

describe("Course Controller Whitebox Tests", () => {
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

  describe("getAllCourses", () => {
    it("should return courses with status 200", async () => {
      const dummyCourses = [{ course_id: 1, title: "Test Course" }];
      stub(CourseModel, "getAll").resolves(dummyCourses);
      req.query = { keyword: "Test" };

      await courseController.getAllCourses(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ data: dummyCourses })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "getAll").rejects(new Error("DB error"));
      await courseController.getAllCourses(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getCourseById", () => {
    it("should return course data if found", async () => {
      const dummyCourse = { course_id: 1, title: "Test Course" };
      req.params.id = "1";
      stub(CourseModel, "getById").resolves(dummyCourse);

      await courseController.getCourseById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ courseData: dummyCourse })).to.be.true;
    });

    it("should return 404 if course not found", async () => {
      req.params.id = "1";
      stub(CourseModel, "getById").resolves(null);

      await courseController.getCourseById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Course not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      stub(CourseModel, "getById").rejects(new Error("DB error"));

      await courseController.getCourseById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("createCourse", () => {
    it("should create a course and return 201", async () => {
      const newCourse = { course_id: 101 };
      stub(CourseModel, "create").resolves(newCourse);
      req.body = { title: "New Course" };

      await courseController.createCourse(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: "Course created successfully",
        data: { courseId: newCourse.course_id }
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "create").rejects(new Error("DB error"));
      req.body = { title: "New Course" };

      await courseController.createCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateCourse", () => {
    it("should update course and return 200", async () => {
      req.params.id = "1";
      req.body = { title: "Updated Title" };
      stub(CourseModel, "update").resolves();

      await courseController.updateCourse(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Course updated successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      req.body = { title: "Updated Title" };
      stub(CourseModel, "update").rejects(new Error("DB error"));

      await courseController.updateCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("deleteCourse", () => {
    it("should return 400 if creator_id is missing", async () => {
      req.params.id = "1";
      req.query = {};
      await courseController.deleteCourse(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "creator_id is required" })).to.be.true;
    });

    it("should delete course and return 200 if successful", async () => {
      req.params.id = "1";
      req.query = { creator_id: "10" };
      stub(CourseModel, "delete").resolves(true);

      await courseController.deleteCourse(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Course deleted successfully" })).to.be.true;
    });

    it("should return 404 if course not found or unauthorized", async () => {
      req.params.id = "1";
      req.query = { creator_id: "10" };
      stub(CourseModel, "delete").resolves(false);

      await courseController.deleteCourse(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        error: "Course not found or you are not authorized to delete it"
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params.id = "1";
      req.query = { creator_id: "10" };
      stub(CourseModel, "delete").rejects(new Error("DB error"));

      await courseController.deleteCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getProviderCourses", () => {
    it("should return provider courses when creator_id is provided", async () => {
      const dummyCourses = [{ course_id: 1, title: "Provider Course" }];
      req.query = { id: 10 };
      stub(CourseModel, "getProviderCourses").resolves(dummyCourses);

      await courseController.getProviderCourses(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ data: dummyCourses })).to.be.true;
    });

    it("should return 400 if creator_id is missing", async () => {
      req.query = {};
      await courseController.getProviderCourses(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "creator_id is required" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { id: 10 };
      stub(CourseModel, "getProviderCourses").rejects(new Error("DB error"));

      await courseController.getProviderCourses(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getEnrolledStudentsForCourse", () => {
    it("should return enrolled students when courseId is provided", async () => {
      const dummyStudents = [{ student_id: 1, name: "Student A" }];
      req.params = { courseId: "1" };
      req.query = { courseId: "1" };
      stub(CourseModel, "getEnrolledStudentsForCourse").resolves(dummyStudents);

      await courseController.getEnrolledStudentsForCourse(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ data: dummyStudents })).to.be.true;
    });

    it("should return 400 if courseId is missing", async () => {
      req.params = {};
      await courseController.getEnrolledStudentsForCourse(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "course_id is required" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { courseId: "1" };
      req.query = { courseId: "1" };
      stub(CourseModel, "getEnrolledStudentsForCourse").rejects(new Error("DB error"));

      await courseController.getEnrolledStudentsForCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getEnrolledStudentsForProvider", () => {
    it("should return enrolled students for provider when creator_id is provided", async () => {
      const dummyStudents = [{ student_id: 1, name: "Student A" }];
      req.query = { creator_id: "10" };
      stub(CourseModel, "getEnrolledStudentsForProvider").resolves(dummyStudents);

      await courseController.getEnrolledStudentsForProvider(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ data: dummyStudents })).to.be.true;
    });

    it("should return 400 if creator_id is missing", async () => {
      req.query = {};
      await courseController.getEnrolledStudentsForProvider(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "creator_id is required" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { creator_id: "10" };
      stub(CourseModel, "getEnrolledStudentsForProvider").rejects(new Error("DB error"));

      await courseController.getEnrolledStudentsForProvider(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("addCourseModule", () => {
    it("should add a course module and return 201", async () => {
      const dummyModule = { module_id: 555 };
      stub(CourseModel, "addModule").resolves(dummyModule);
      req.body = { course_id: 1, title: "New Module" };

      await courseController.addCourseModule(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: "Course module added successfully!",
        module_id: dummyModule.module_id
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseModel, "addModule").rejects(new Error("DB error"));
      req.body = { course_id: 1, title: "New Module" };

      await courseController.addCourseModule(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getCourseModules", () => {
    it("should return modules when course_id is provided", async () => {
      const dummyModules = [{ module_id: 1, title: "Module 1" }];
      req.query = { course_id: "1" };
      stub(CourseModel, "getModules").resolves(dummyModules);

      await courseController.getCourseModules(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ data: dummyModules })).to.be.true;
    });

    it("should return 400 if course_id is missing", async () => {
      req.query = {};
      await courseController.getCourseModules(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "course_id is required" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { course_id: "1" };
      stub(CourseModel, "getModules").rejects(new Error("DB error"));

      await courseController.getCourseModules(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateCourseModule", () => {
    it("should update a module and return 200 if successful", async () => {
      req.params = { module_id: "123" };
      req.body = { title: "Updated Module" };
      stub(CourseModel, "updateModule").resolves(true);

      await courseController.updateCourseModule(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Module updated successfully" })).to.be.true;
    });

    it("should return 404 if module not found or not updated", async () => {
      req.params = { module_id: "123" };
      req.body = { title: "Updated Module" };
      stub(CourseModel, "updateModule").resolves(false);

      await courseController.updateCourseModule(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Module not found or not updated" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { module_id: "123" };
      req.body = { title: "Updated Module" };
      stub(CourseModel, "updateModule").rejects(new Error("DB error"));

      await courseController.updateCourseModule(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });
});