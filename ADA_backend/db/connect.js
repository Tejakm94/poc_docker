const sql = require("mssql");
const { configurations } = require("../config/config");

const database = configurations.Database;

const pool = new sql.ConnectionPool({
  server: process.env.DB_HOST || database.host,
  port: Number(process.env.DB_PORT || database.port || 1433),
  user: process.env.DB_USER || database.username,
  password: process.env.DB_PASSWORD || database.password,
  database: process.env.DB_NAME || database.databaseName,
  pool: {
    max: Number(process.env.DB_POOL_SIZE || configurations.dbPoolSize || 10),
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
  },
});

// Windows Integrated Authentication alternative:
// const sql = require("mssql/msnodesqlv8");
// Use this config instead of the SQL username/password above:
// {
//   server: process.env.DB_HOST || database.host,
//   database: process.env.DB_NAME || database.databaseName,
//   driver: "msnodesqlv8",
//   options: { trustedConnection: true },
// }

let connectedPool;

function connectPool() {
  if (!connectedPool) connectedPool = pool.connect();
  return connectedPool;
}

function normalizeQuery(query) {
  let parameterIndex = 0;
  const hasLimitOne = /\s+LIMIT\s+1\s*$/i.test(query);
  return query
    .replace(/`([^`]*)`/g, "[$1]")
    .replace(/\bNOW\(\)/gi, "GETDATE()")
    .replace(/CAST\(SUBSTRING\(([^,]+),\s*4\) AS UNSIGNED\)/gi, "TRY_CONVERT(INT, SUBSTRING($1, 4, 8000))")
    .replace(/\s+LIMIT\s+1\s*$/i, "")
    .replace(/^\s*SELECT\b/i, (selectKeyword) =>
      hasLimitOne ? `${selectKeyword} TOP 1` : selectKeyword,
    )
    .replace(/\?/g, () => `@param${++parameterIndex}`);
}

async function execute(query, values = []) {
  const connection = await connectPool();
  const request = connection.request();

  values.forEach((value, index) => request.input(`param${index + 1}`, value === undefined ? null : value));

  const isInsert = /^\s*INSERT\b/i.test(query);
  const statement = normalizeQuery(query);
  const result = await request.query(
    isInsert
      ? `${statement.replace(/;\s*$/, "")}; SELECT CAST(SCOPE_IDENTITY() AS INT) AS insertId;`
      : statement,
  );
  const rows = isInsert
    ? result.recordsets[result.recordsets.length - 1] || []
    : result.recordset || [];

  return [rows, {
    affectedRows: result.rowsAffected.reduce((total, count) => total + count, 0),
    insertId: rows[0] && rows[0].insertId,
  }];
}

pool.execute = execute;
pool.end = async () => {
  connectedPool = undefined;
  return pool.close();
};

async function reconnect() {
  await pool.close();
  connectedPool = undefined;
  await connectPool();
}

async function testConnection() {
  const connection = await connectPool();
  await connection.request().query("SELECT 1 AS connected");
}

module.exports = { pool, reconnect, testConnection };
