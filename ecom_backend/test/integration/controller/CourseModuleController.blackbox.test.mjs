import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { stub, restore } from "sinon";
import { expect } from "chai";

import courseModuleController from "../../../controller/CourseModuleController.js";
import CourseModuleModel from "../../../models/CourseModuleModel.js";

const app = express();
app.use(bodyParser.json());
app.get("/courses/:courseId/modules", courseModuleController.getAllModulesForCourse);
app.get("/courses/:courseId/modules/:moduleId", courseModuleController.getModuleById);
app.post("/courses/:courseId/modules", courseModuleController.createModule);
app.put("/courses/:courseId/modules/:moduleId", courseModuleController.updateModule);
app.delete("/courses/:courseId/modules/:moduleId", courseModuleController.deleteModule);

describe("CourseModuleController Blackbox Tests", () => {
  afterEach(() => {
    restore();
  });

  describe("GET /courses/:courseId/modules", () => {
    it("should return all modules for the given course", async () => {
      const dummyModules = [{ module_id: 1, moduleName: "Module 1" }];
      stub(CourseModuleModel, "getAllForCourse").resolves(dummyModules);
      const res = await request(app).get("/courses/100/modules");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyModules);
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "getAllForCourse").rejects(new Error("DB error"));
      const res = await request(app).get("/courses/100/modules");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("GET /courses/:courseId/modules/:moduleId", () => {
    it("should return module data if found", async () => {
      const dummyModule = { module_id: 2, moduleName: "Module 2" };
      stub(CourseModuleModel, "getById").resolves(dummyModule);
      const res = await request(app).get("/courses/100/modules/2");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(dummyModule);
    });

    it("should return 404 if module not found", async () => {
      stub(CourseModuleModel, "getById").resolves(null);
      const res = await request(app).get("/courses/100/modules/999");
      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({ error: "Module not found" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "getById").rejects(new Error("DB error"));
      const res = await request(app).get("/courses/100/modules/2");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("POST /courses/:courseId/modules", () => {
    it("should create a new module and return 201", async () => {
      const dummyModule = { module_id: 55 };
      stub(CourseModuleModel, "create").resolves(dummyModule);
      const moduleData = { moduleName: "New Module", moduleContent: "Some content" };
      const res = await request(app)
        .post("/courses/100/modules")
        .send(moduleData);
      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({
        message: "Module created successfully",
        moduleId: dummyModule.module_id
      });
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "create").rejects(new Error("DB error"));
      const moduleData = { moduleName: "New Module", moduleContent: "Some content" };
      const res = await request(app)
        .post("/courses/100/modules")
        .send(moduleData);
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("PUT /courses/:courseId/modules/:moduleId", () => {
    it("should update a module and return 200", async () => {
      stub(CourseModuleModel, "update").resolves();
      const updateData = { moduleName: "Updated Name", moduleContent: "Updated content" };
      const res = await request(app)
        .put("/courses/100/modules/55")
        .send(updateData);
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Module updated successfully" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "update").rejects(new Error("DB error"));
      const updateData = { moduleName: "Updated Name", moduleContent: "Updated content" };
      const res = await request(app)
        .put("/courses/100/modules/55")
        .send(updateData);
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });

  describe("DELETE /courses/:courseId/modules/:moduleId", () => {
    it("should delete a module and return 200", async () => {
      stub(CourseModuleModel, "delete").resolves();
      const res = await request(app).delete("/courses/100/modules/55");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Module deleted successfully" });
    });

    it("should return 500 on error", async () => {
      stub(CourseModuleModel, "delete").rejects(new Error("DB error"));
      const res = await request(app).delete("/courses/100/modules/55");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Database query failed" });
    });
  });
});