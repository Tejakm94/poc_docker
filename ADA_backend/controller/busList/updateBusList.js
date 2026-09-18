const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  updateBusListService,
} = require("../../service/busListServies");
// const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");
 
exports.updateBusList = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.updateBusListLogger);
  const {
    id,
    busId,
    updatedBy,
  } = req.body;
  const result = await updateBusListService(
    id,
    busId,
    updatedBy,
  );
  res.status(StatusCodes.OK).json(result);
});

 
