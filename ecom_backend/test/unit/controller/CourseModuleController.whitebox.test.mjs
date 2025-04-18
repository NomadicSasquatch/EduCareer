import { expect } from "chai";
import { stub, restore } from "sinon";
import courseModuleController from "../../../controller/CourseModuleController.js";
import CourseModuleModel from "../../../models/CourseModuleModel.js";

describe("CourseModuleController Whitebox Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
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

  describe("getAllModulesForCourse", () => {
    it("should return all modules for a course with status 200", async () => {
      const dummyModules = [{ module_id: 1, moduleName: "Module 1" }];
      stub(CourseModuleModel, "getAllForCourse").resolves(dummyModules);
      req.params.courseId = "100";

      await courseModuleController.getAllModulesForCourse(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyModules)).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "getAllForCourse").rejects(new Error("DB error"));
      req.params.courseId = "100";

      await courseModuleController.getAllModulesForCourse(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("getModuleById", () => {
    it("should return module data if found", async () => {
      const dummyModule = { module_id: 55, moduleName: "Module 55" };
      req.params = { courseId: "100", moduleId: "55" };
      stub(CourseModuleModel, "getById").resolves(dummyModule);

      await courseModuleController.getModuleById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(dummyModule)).to.be.true;
    });

    it("should return 404 if module is not found", async () => {
      req.params = { courseId: "100", moduleId: "999" };
      stub(CourseModuleModel, "getById").resolves(null);

      await courseModuleController.getModuleById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Module not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { courseId: "100", moduleId: "55" };
      stub(CourseModuleModel, "getById").rejects(new Error("DB error"));

      await courseModuleController.getModuleById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("createModule", () => {
    it("should create a module and return 201", async () => {
      const dummyModule = { module_id: 77 };
      stub(CourseModuleModel, "create").resolves(dummyModule);
      req.params.courseId = "100";
      req.body = { moduleName: "New Module", moduleContent: "Content here" };

      await courseModuleController.createModule(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({
        message: "Module created successfully",
        moduleId: dummyModule.module_id
      })).to.be.true;
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "create").rejects(new Error("DB error"));
      req.params.courseId = "100";
      req.body = { moduleName: "New Module", moduleContent: "Content here" };

      await courseModuleController.createModule(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("updateModule", () => {
    it("should update a module and return 200", async () => {
      req.params = { courseId: "100", moduleId: "77" };
      req.body = { moduleName: "Updated Module", moduleContent: "Updated content" };
      stub(CourseModuleModel, "update").resolves();

      await courseModuleController.updateModule(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Module updated successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { courseId: "100", moduleId: "77" };
      req.body = { moduleName: "Updated Module", moduleContent: "Updated content" };
      stub(CourseModuleModel, "update").rejects(new Error("DB error"));

      await courseModuleController.updateModule(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });

  describe("deleteModule", () => {
    it("should delete a module and return 200", async () => {
      req.params = { courseId: "100", moduleId: "77" };
      stub(CourseModuleModel, "delete").resolves();

      await courseModuleController.deleteModule(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ message: "Module deleted successfully" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { courseId: "100", moduleId: "77" };
      stub(CourseModuleModel, "delete").rejects(new Error("DB error"));

      await courseModuleController.deleteModule(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Database query failed" })).to.be.true;
    });
  });
});