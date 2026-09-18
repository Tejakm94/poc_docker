const { randomUUID } = require("crypto");
const { pool } = require("../connect");

const allowedTables = new Set([
  "RemoteTerminalMaintenance", "MessageMaintenance", "WordMaintenance", "ElementMaintenance",
]);

function assertTable(table) {
  if (!allowedTables.has(table)) throw new Error("Unsupported maintenance table");
}

function assertFields(fields) {
  if (fields.some((field) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(field))) {
    throw new Error("Invalid column name");
  }
}

function model(table) {
  assertTable(table);
  return {
    async create(data) {
      const record = { Id: randomUUID(), ...data };
      const fields = Object.keys(record);
      assertFields(fields);
      const placeholders = fields.map(() => "?").join(", ");
      await pool.execute(
        `INSERT INTO \`${table}\` (${fields.map((field) => `\`${field}\``).join(", ")}) VALUES (${placeholders})`,
        fields.map((field) => record[field]),
      );
      return record;
    },
    async findById(id) {
      const [rows] = await pool.execute(`SELECT * FROM \`${table}\` WHERE Id = ?`, [id]);
      return rows[0] || null;
    },
    async findAll() {
      const [rows] = await pool.execute(`SELECT * FROM \`${table}\` ORDER BY CreatedAt DESC`);
      return rows;
    },
  };
}

module.exports = {
  remoteTerminal: model("RemoteTerminalMaintenance"),
  message: model("MessageMaintenance"),
  word: model("WordMaintenance"),
  element: model("ElementMaintenance"),
};
