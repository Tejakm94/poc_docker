const { pool, testConnection } = require("./connect");
const { createSchema } = require("./schema");

async function initializeDatabase() {
  await testConnection();
  await createSchema();
  console.log("Connected successfully.");
  // console.log("Maintenance and lookup tables are ready.");
}

module.exports = { initializeDatabase };

// When this file is run directly (npm run db:init), close the pool afterwards.
if (require.main === module) {
  initializeDatabase()
    .catch((error) => {
      console.error("Database initialization failed:", error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
