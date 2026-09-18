const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  getAllMessageMaintenanceService,
} = require("../../service/messageMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllMessageMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllMessageMaintenanceLogger);
  const result = await getAllMessageMaintenanceService();

  res.status(StatusCodes.OK).json(result);
});
