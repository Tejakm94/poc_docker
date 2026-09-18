const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  getAllWordMaintenanceService,
} = require("../../service/wordMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllWordMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllWordMaintenanceLogger);
  const result = await getAllWordMaintenanceService();

  res.status(StatusCodes.OK).json(result);
});
