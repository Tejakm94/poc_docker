const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const { addBusListService } = require("../../service/busListServies");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.addBusList = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.addBusListLogger);
  const { busId, createdBy } = req.body;
  const result = await addBusListService(busId, createdBy);
  res.status(StatusCodes.OK).json(result);
});
