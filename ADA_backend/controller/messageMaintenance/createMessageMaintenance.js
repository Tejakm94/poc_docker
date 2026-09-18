const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  createMessageMaintenanceService,
} = require("../../service/messageMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.createMessageMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.createMessageMaintenanceLogger);
  const result = await createMessageMaintenanceService(req.body);

  res.status(StatusCodes.OK).json(result);
});
