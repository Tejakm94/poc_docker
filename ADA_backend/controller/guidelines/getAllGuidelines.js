const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const { getAllGuidelinesService } = require("../../service/guidelinesServices");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllGuidelines = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllGuidelinesLogger);
  const result = await getAllGuidelinesService();
  res.status(StatusCodes.OK).json(result);
});
