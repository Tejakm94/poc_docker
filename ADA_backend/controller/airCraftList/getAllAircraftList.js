const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  getAllAircraftListService,
} = require("../../service/aircraftListService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.getAllAircraftList = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.getAllAircraftListLogger);
  const result = await getAllAircraftListService();
  res.status(StatusCodes.OK).json(result);
});
