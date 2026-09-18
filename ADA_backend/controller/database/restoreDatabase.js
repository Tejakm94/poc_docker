const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const { restoreDatabaseService } = require("../../service/restoreDatabaseService");

exports.restoreDatabase = asyncWrapper(async (req, res) => {
  const configuredApiKey = process.env.DB_RESTORE_API_KEY;
  const providedApiKey = req.get("x-restore-api-key");

  if (!configuredApiKey || providedApiKey !== configuredApiKey) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 0,
      message: "Unauthorized",
    });
  }

  const result = await restoreDatabaseService();
  return res.status(StatusCodes.OK).json({
    status: 1,
    message: "Database restored successfully",
    data: result,
  });
});