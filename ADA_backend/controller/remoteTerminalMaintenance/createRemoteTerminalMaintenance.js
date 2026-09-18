const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../../middleware/async");
const {
  createRemoteTerminalMaintenanceService,
} = require("../../service/remoteTerminalMaintenanceService");
const { configurations } = require("../../config/config");
const { logger } = require("../../logs/logger");

exports.createRemoteTerminalMaintenance = asyncWrapper(async (req, res) => {
  logger.info(configurations.logger.createRemoteTerminalMaintenanceLogger);

  const {
    lruName,
    equipment,
    manufactureId,
    busId,
    rtAddress,
    icdVersionId,
    swVersion,
    releaseVersion,
    amndNo,
    rtNote,
    rtRemarks,
    createdBy,
    aircraftType,
    selectAircraftIds,
    guidelineId,
    selectedProgrammesId,
    hardwareVersion,
    amndDate,
    adminRemarks,
    fileName,
  } = req.body;

  const result = await createRemoteTerminalMaintenanceService(
    lruName,
    equipment,
    manufactureId,
    busId,
    rtAddress,
    icdVersionId,
    swVersion,
    releaseVersion,
    amndNo,
    rtNote,
    rtRemarks,
    createdBy,
    aircraftType,
    selectAircraftIds,
    guidelineId,
    selectedProgrammesId,
    hardwareVersion,
    amndDate,
    adminRemarks,
    fileName,
  );

  res.status(StatusCodes.OK).json(result);
});
