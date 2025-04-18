import { expect } from "chai";
import { stub, restore } from "sinon";
import { getAdminTableData, updateAdminTableData } from "../../../controller/AdminController.js";
import db from "../../../db.js";

describe("AdminController", () => {
  let req, res;

  beforeEach(() => {
    req = {
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

  describe("getAdminTableData", () => {
    it("should return 400 if the table query parameter is missing", async () => {
      req.query = {};
      await getAdminTableData(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Invalid table name" })).to.be.true;
    });

    it("should return 400 if the table query parameter is invalid", async () => {
      req.query = { table: "NonExistingTable" };
      await getAdminTableData(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Invalid table name" })).to.be.true;
    });

    it("should query admin data correctly for Admin table", async () => {
      req.query = { table: "Admin" };
      const fakeRows = [{ user_id: 1, username: "admin" }];
      const dbQueryStub = stub(db, "query").resolves([fakeRows]);

      await getAdminTableData(req, res);

      expect(dbQueryStub.calledOnce).to.be.true;
      expect(
        dbQueryStub.calledWithExactly("SELECT * FROM ?? WHERE role = ?", [
          "UserAccount",
          "admin"
        ])
      ).to.be.true;
      expect(res.json.calledWith(fakeRows)).to.be.true;
    });

    it("should query non-admin table correctly", async () => {
      req.query = { table: "Courses" };
      const fakeRows = [{ course_id: 101, course_name: "Course 101" }];
      const dbQueryStub = stub(db, "query").resolves([fakeRows]);

      await getAdminTableData(req, res);

      expect(dbQueryStub.calledOnce).to.be.true;
      expect(dbQueryStub.calledWithExactly("SELECT * FROM ??", ["Course"])).to.be.true;
      expect(res.json.calledWith(fakeRows)).to.be.true;
    });

    it("should return 500 if db.query throws an error", async () => {
      req.query = { table: "Courses" };
      stub(db, "query").rejects(new Error("Database error"));

      await getAdminTableData(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Internal server error" })).to.be.true;
    });
  });

  describe("updateAdminTableData", () => {
    it("should return 400 if the table query parameter is missing", async () => {
      req.query = {};
      req.body = { data: [] };
      await updateAdminTableData(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Invalid table name" })).to.be.true;
    });

    it("should return 400 if data is missing or not an array", async () => {
      req.query = { table: "Courses" };
      req.body = { data: "notAnArray" };
      await updateAdminTableData(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWith({ error: "Invalid data format, expected an array" })
      ).to.be.true;
    });

    it("should process update requests correctly", async () => {
      req.query = { table: "Courses" };
      req.body = {
        data: [
          {
            course_id: 101,
            module_name: "Updated Course Name",
            created_at: "2023-04-01T12:00:00Z"
          }
        ]
      };

      const dbQueryStub = stub(db, "query").resolves();

      await updateAdminTableData(req, res);

      expect(dbQueryStub.called).to.be.true;
      expect(res.json.calledWith({ message: "Data updated successfully" })).to.be.true;
    });

    it("should return 500 if any db.query throws an error during update", async () => {
      req.query = { table: "Courses" };
      req.body = { data: [{ course_id: 101, module_name: "Name" }] };
      stub(db, "query").rejects(new Error("Database error"));

      await updateAdminTableData(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Internal server error" })).to.be.true;
    });
  });
});