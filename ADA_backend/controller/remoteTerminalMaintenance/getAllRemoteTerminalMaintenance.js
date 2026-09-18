const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  getAllRemoteTerminalMaintenanceService,
} = require("../../service/remoteTerminalMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllRemoteTerminalMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllRemoteTerminalMaintenanceLogger);
  const result = await getAllRemoteTerminalMaintenanceService();

  res.status(StatusCodes.OK).json(result);
});
