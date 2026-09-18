const fs = require("fs");
const path = require("path");
const sql = require("mssql");
const { configurations } = require("../config/config");
const { pool, reconnect } = require("../db/connect");
const { logger } = require("../logs/logger");

function getSqlConfig(databaseName) {
  return {
    server: process.env.DB_HOST || configurations.Database.host,
    port: Number(process.env.DB_PORT || configurations.Database.port || 1433),
    user: process.env.DB_USER || configurations.Database.username,
    password: process.env.DB_PASSWORD || configurations.Database.password,
    database: databaseName,
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate:
        process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
    },
  };
}

function getBackupPath() {
  const backupPath = process.env.DB_BACKUP_PATH;
  const backupDirectory = process.env.DB_BACKUP_DIR;

  if (!backupPath || !backupDirectory) {
    throw new Error("DB_BACKUP_PATH and DB_BACKUP_DIR must be configured");
  }

  const resolvedPath = path.resolve(backupPath);
  const resolvedDirectory = path.resolve(backupDirectory);
  const relativePath = path.relative(resolvedDirectory, resolvedPath);

  if (
    !resolvedPath.toLowerCase().endsWith(".bak") ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("The backup file must be a .bak file inside DB_BACKUP_DIR");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Backup file was not found: ${resolvedPath}`);
  }

  return resolvedPath;
}

function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}

async function restoreDatabaseService() {
  const databaseName = process.env.RESTORE_DB_NAME;
  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error("DB_NAME may contain only letters, numbers, and underscores");
  }

  const backupPath = getBackupPath();
  await pool.end();
  const masterPool = await new sql.ConnectionPool(getSqlConfig("master")).connect();

  try {
    await masterPool
      .request()
      .query(`
        RESTORE VERIFYONLY FROM DISK = '${escapeSqlLiteral(backupPath)}'
      `);

    const backupResult = await masterPool
      .request()
      .query(`
        RESTORE FILELISTONLY FROM DISK = '${escapeSqlLiteral(backupPath)}'
      `);

    if (backupResult.recordset.length < 1) {
      throw new Error("The backup does not contain any database files");
    }

    const dataDirectory = process.env.DB_DATA_DIR;
    const logDirectory = process.env.DB_LOG_DIR || dataDirectory;

    if (!dataDirectory || !logDirectory) {
      throw new Error("DB_DATA_DIR and DB_LOG_DIR must be configured");
    }

    const moveClauses = backupResult.recordset.map((file) => {
      const targetDirectory = file.Type === "L" ? logDirectory : dataDirectory;
      const extension = file.Type === "L" ? ".ldf" : ".mdf";
      const targetPath = path.join(targetDirectory, `${databaseName}_${file.FileId}${extension}`);
      return `MOVE '${escapeSqlLiteral(file.LogicalName)}' TO '${escapeSqlLiteral(targetPath)}'`;
    });

    const request = masterPool.request();

    await request.query(`
      IF DB_ID(N'${escapeSqlLiteral(databaseName)}') IS NOT NULL
      BEGIN
        ALTER DATABASE [${databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${databaseName}];
      END;
      RESTORE DATABASE [${databaseName}]
      FROM DISK = '${escapeSqlLiteral(backupPath)}'
      WITH ${moveClauses.join(", ")}, RECOVERY, REPLACE;
    `);

    await reconnect();
    return { backupPath, databaseName };
  } catch (error) {
    logger.error(error.stack)
    const details = (error.precedingErrors || [])
      .concat(error)
      .map((item) => item.message)
      .filter(Boolean)
      .join(" | ");
    throw new Error(`Database restore failed: ${details}`);
  } finally {
    await masterPool.close();
  }
}

module.exports = { restoreDatabaseService };