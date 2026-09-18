const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  getAllElementMaintenanceService,
} = require("../../service/elementMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllElementMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllElementMaintenanceLogger);
  const result = await getAllElementMaintenanceService();

  res.status(StatusCodes.OK).json(result);
});
