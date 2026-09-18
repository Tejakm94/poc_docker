const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const { getAllBusListService } = require("../../service/busListServies");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllBusList = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllBusListLogger);
  const result = await getAllBusListService();
  res.status(StatusCodes.OK).json(result);
});
