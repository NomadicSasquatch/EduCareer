const db = require("../db");
const { hashingPassword } = require("../services/PasswordService");

const tableMap = {
  UserAccount: "UserAccount",
  Courses: "Course",
  OrderCourse: "OrderCourse",
  Learners: "LearnerProfile",
  Producer: "ProviderProfile",
  CourseEnrollment: "CourseEnrollment",
  Admin: "UserAccount",
  "Contact Us Feedback": "ContactUsFeedback",
};

const primaryKeyMap = {
  UserAccount: "user_id",
  Course: "course_id",
  OrderCourse: "order_course_id",
  LearnerProfile: "learner_id",
  ProviderProfile: "provider_id",
  CourseEnrollment: "enrollment_id",
  Admin: "user_id",
  ContactUsFeedback: "feedback_id",
};

const getAdminTableData = async (req, res) => {
  try {
    const { table } = req.query;
    const normalizedTable = tableMap[table];
    if (!table || !normalizedTable) {
      return res.status(400).json({ error: "Invalid table name" });
    }
    if (table === "Admin") {
      const [rows] = await db.query(`SELECT * FROM ?? WHERE role = ?`, [
        normalizedTable,
        "admin",
      ]);
      return res.json(rows);
    }
    const [rows] = await db.query(`SELECT * FROM ??`, [normalizedTable]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching admin table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAdminTableData = async (req, res) => {
  try {
    const { table } = req.query;
    const { data } = req.body;
    const normalizedTable = tableMap[table];
    if (!table || !normalizedTable) {
      return res.status(400).json({ error: "Invalid table name" });
    }
    if (!data || !Array.isArray(data)) {
      return res
        .status(400)
        .json({ error: "Invalid data format, expected an array" });
    }
    const primaryKey = primaryKeyMap[normalizedTable] || "id";
    for (const row of data) {
      const rowId = row[primaryKey] || row.id;
      if (!rowId) {
        continue;
      }
      const { [primaryKey]: ignore, ...fields } = row;
      if (fields.created_at) {
        const d = new Date(fields.created_at);
        if (!isNaN(d)) {
          fields.created_at = d.toISOString().slice(0, 19).replace("T", " ");
        }
      }
      await db.query(`UPDATE ?? SET ? WHERE ${primaryKey} = ?`, [
        normalizedTable,
        fields,
        rowId,
      ]);
    }
    res.json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating admin table data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createAdminAccount = async (req, res) => {
  console.log(req.body);
  try {
    const {
      username,
      email,
      password_hash,
      first_name,
      last_name,
      phone_number,
      name,
    } = req.body;

    console.log(username);
    console.log(email);
    console.log(password_hash);
    if (!username || !email || !password_hash) {
      return res
        .status(400)
        .json({ error: "Username, email and password are required" });
    }
    // Use 'first_name' if provided, otherwise use 'name'
    const finalFirstName = first_name || name || null;
    const hashedPassword = await hashingPassword(password_hash);
    const [result] = await db.query(
      `INSERT INTO UserAccount (username, email, password_hash, first_name, last_name, phone_number, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        finalFirstName,
        last_name || null,
        phone_number || null,
        "admin",
      ]
    );
    res.json({
      message: "Admin account created successfully",
      adminId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating admin account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAdminAccount,
  updateAdminTableData,
  getAdminTableData,
};
