import request from "supertest";
import express from "express";
import pkg from 'body-parser';
const { json } = pkg;
import { restore, stub } from "sinon";
import { expect } from "chai";

import { getAdminTableData, updateAdminTableData } from "../../../controller/AdminController.js";
import db from "../../../db.js";

const app = express();
app.use(json());
app.get("/admin/data", getAdminTableData);
app.put("/admin/data", updateAdminTableData);

describe("AdminController Blackbox Tests", function () {
  afterEach(() => {
    restore();
  });

  describe("GET /admin/data", function () {
    it("should return 400 when the table query parameter is missing", async function () {
      const res = await request(app).get("/admin/data");
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "Invalid table name" });
    });

    it("should return 400 when the table query parameter is invalid", async function () {
      const res = await request(app).get("/admin/data?table=NonExistingTable");
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "Invalid table name" });
    });

    it('should return admin data correctly when table parameter is "Admin"', async function () {
      const fakeRows = [{ user_id: 1, username: "admin" }];
      stub(db, "query").resolves([fakeRows]);

      const res = await request(app).get("/admin/data?table=Admin");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(fakeRows);
    });

    it("should return non-admin table data when a valid table parameter is provided", async function () {
      const fakeRows = [{ course_id: 101, course_name: "Course 101" }];
      stub(db, "query").resolves([fakeRows]);

      const res = await request(app).get("/admin/data?table=Courses");
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(fakeRows);
    });

    it("should return 500 if db.query throws an error", async function () {
      stub(db, "query").rejects(new Error("Database error"));

      const res = await request(app).get("/admin/data?table=Courses");
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Internal server error" });
    });
  });

  describe("PUT /admin/data", function () {
    it("should return 400 when the table query parameter is missing", async function () {
      const res = await request(app).put("/admin/data").send({ data: [] });
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({ error: "Invalid table name" });
    });

    it("should return 400 when data is missing or not an array", async function () {
      const res = await request(app)
        .put("/admin/data?table=Courses")
        .send({ data: "notAnArray" });
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        error: "Invalid data format, expected an array"
      });
    });

    it("should process update requests correctly", async function () {
      const updateData = [
        {
          course_id: 101,
          module_name: "Updated Course Name",
          created_at: "2023-04-01T12:00:00Z"
        }
      ];
      const dbQueryStub = stub(db, "query");
      dbQueryStub.onCall(0).resolves();
      const fakeUpdatedRow = [{ course_id: 101, module_name: "Updated Course Name", created_at: "2023-04-01 12:00:00" }];
      dbQueryStub.onCall(1).resolves([fakeUpdatedRow]);

      const res = await request(app)
        .put("/admin/data?table=Courses")
        .send({ data: updateData });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ message: "Data updated successfully" });
    });

    it("should return 500 if db.query throws an error during update", async function () {
      stub(db, "query").rejects(new Error("Database error"));

      const res = await request(app)
        .put("/admin/data?table=Courses")
        .send({ data: [{ course_id: 101, module_name: "Name" }] });
      expect(res.status).to.equal(500);
      expect(res.body).to.deep.equal({ error: "Internal server error" });
    });
  });
});